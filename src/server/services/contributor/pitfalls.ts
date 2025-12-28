import { Octokit } from "@octokit/rest";
import OpenAI from "openai";
import { redis } from "@/lib/redis";
import { getTokenHash } from "@/server/services/github/shared";
import type {
  PRFileChange,
  PRReview,
  PRLineComment,
  RejectedPRDetails,
  PitfallsResult,
  SpammerProfile,
} from "@/server/types";

const MAINTAINER_ROLES = ["OWNER", "MEMBER", "COLLABORATOR"];
const CACHE_TTL = 60 * 60 * 24; // 24 hours

// Lazy OpenAI initialization
let openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

async function fetchRejectedPRs(octokit: Octokit, owner: string, repo: string) {
  const response = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "closed",
    per_page: 100,
    sort: "updated",
    direction: "desc",
  });

  const closedPRs = response.data;

  // Filter: not merged + not from maintainers
  const rejectedCommunityPRs = closedPRs.filter((pr) => {
    const isNotMerged = pr.merged_at === null;
    const isFromCommunity = !MAINTAINER_ROLES.includes(pr.author_association);
    return isNotMerged && isFromCommunity;
  });

  // Limit to 50 most recent for larger repos
  return rejectedCommunityPRs.slice(0, 50);
}

// Spam detection patterns
const SPAM_TITLE_PATTERNS = [
  /add(ed|ing)?\s+(my\s+)?name/i,
  /update(d)?\s+readme/i,
  /add(ed|ing)?\s+myself/i,
  /first\s+contribution/i,
  /hacktoberfest/i,
  /\btest\s*pr\b/i,
];

// Check if a PR looks like spam based on title and files
function detectSpam(
  pr: {
    number: number;
    title: string;
    user: { login: string; avatar_url: string } | null;
  },
  files: PRFileChange[]
): { isSpam: boolean; reason: string } {
  const title = pr.title.toLowerCase();

  // Check if only touches README
  const isReadmeOnly =
    files.length === 1 && files[0].filename.toLowerCase().includes("readme");

  // Check for spam title patterns
  for (const pattern of SPAM_TITLE_PATTERNS) {
    if (pattern.test(pr.title)) {
      if (isReadmeOnly) {
        return { isSpam: true, reason: "Added name to README" };
      }
      if (title.includes("hacktoberfest")) {
        return {
          isSpam: true,
          reason: "Low-effort Hacktoberfest contribution",
        };
      }
    }
  }

  // Very small changes to README only
  if (isReadmeOnly && files[0].additions < 5 && files[0].deletions < 3) {
    return { isSpam: true, reason: "Trivial README change" };
  }

  return { isSpam: false, reason: "" };
}

// Get detailed information for a single PR
async function getPRDetails(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number
): Promise<{
  files: PRFileChange[];
  reviews: PRReview[];
  lineComments: PRLineComment[];
}> {
  const [filesRes, reviewsRes, commentsRes] = await Promise.all([
    octokit.rest.pulls.listFiles({ owner, repo, pull_number: prNumber }),
    octokit.rest.pulls.listReviews({ owner, repo, pull_number: prNumber }),
    octokit.rest.pulls.listReviewComments({
      owner,
      repo,
      pull_number: prNumber,
    }),
  ]);

  // Transform files
  const files: PRFileChange[] = filesRes.data.map((f) => {
    return {
      filename: f.filename,
      status: f.status as PRFileChange["status"],
      additions: f.additions,
      deletions: f.deletions,
      diff: f.patch ?? null,
    };
  });

  // Transform reviews - filter out short/empty ones
  const reviews: PRReview[] = reviewsRes.data
    .filter((r) => r.body && r.body.length > 20)
    .map((r) => {
      return {
        reviewer: r.user?.login ?? "unknown",
        state: r.state,
        body: r.body ?? "",
      };
    });

  // Transform line comments
  const lineComments: PRLineComment[] = commentsRes.data.map((c) => {
    return {
      path: c.path,
      line: c.line ?? c.original_line ?? 0,
      body: c.body,
      codeContext: c.diff_hunk ?? "",
    };
  });

  return { files, reviews, lineComments };
}

// Fetch CONTRIBUTING.md if exists
async function getContributingGuide(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: "CONTRIBUTING.md",
    });

    if ("content" in response.data && response.data.content) {
      const content = Buffer.from(response.data.content, "base64").toString(
        "utf-8"
      );
      // Limit to first 2000 chars to save tokens
      return content.slice(0, 2000);
    }
    return null;
  } catch {
    // File doesn't exist
    return null;
  }
}

// Build AI prompt with all context
function buildPrompt(
  prs: RejectedPRDetails[],
  contributingGuide: string | null,
  owner: string,
  repo: string
): string {
  // Limit data to prevent token overflow
  const prData = prs.map((pr) => {
    return {
      number: pr.number,
      title: pr.title,
      files: pr.files.slice(0, 8).map((f) => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        // Truncate long diffs
        diff: f.diff ? f.diff.slice(0, 500) : null,
      })),
      reviews: pr.reviews.slice(0, 5),
      lineComments: pr.lineComments.slice(0, 10).map((c) => ({
        path: c.path,
        line: c.line,
        body: c.body,
        // Truncate code context
        codeContext: c.codeContext.slice(0, 300),
      })),
    };
  });

  let prompt = `You are analyzing rejected Pull Requests from ${owner}/${repo} to help future contributors avoid common mistakes.

`;

  // Add CONTRIBUTING.md context if available
  if (contributingGuide) {
    prompt += `PROJECT CONTRIBUTING GUIDELINES:
${contributingGuide}

`;
  }

  prompt += `REJECTED PRS DATA:
${JSON.stringify(prData, null, 2)}

INSTRUCTIONS:
1. Analyze each PR's code changes (diff) and correlate with reviewer feedback
2. Identify what specific code or approach caused the rejection
3. Quote the reviewer's feedback to show what maintainers look for
4. Provide actionable advice on what to do instead

For each PR return:
- prNumber: the PR number
- mistake: specific code change that caused rejection (reference file names and what was wrong)
- reviewFeedback: direct quote from reviewer explaining the issue
- advice: what contributor should have done (be specific, give examples if helpful)
- category: one of "tests" | "style" | "scope" | "setup" | "breaking" | "docs"

After analyzing all PRs, identify top 3 patterns/common mistakes.

Return valid JSON:
{
  "analyses": [
    {
      "prNumber": 123,
      "mistake": "...",
      "reviewFeedback": "...",
      "advice": "...",
      "category": "..."
    }
  ],
  "patterns": [
    "Pattern 1: ...",
    "Pattern 2: ...",
    "Pattern 3: ..."
  ]
}`;

  return prompt;
}

// Call OpenAI with the prompt
async function analyzeWithAI(prompt: string): Promise<PitfallsResult> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content || "{}";
  const parsed = JSON.parse(content);

  const result: PitfallsResult = {
    analyses: parsed.analyses || [],
    patterns: parsed.patterns || [],
    analyzedCount: parsed.analyses?.length || 0,
    spammers: [],
  };

  return result;
}

//Get pitfalls analysis for a repository
export async function getPitfalls(
  octokit: Octokit,
  owner: string,
  repo: string,
  accessToken?: string | null
): Promise<PitfallsResult> {
  // Cache key with token hash for private repo isolation
  const tokenHash = getTokenHash(accessToken);
  const cacheKey = `pitfalls:${owner}:${repo}:${tokenHash}`;

  // Check cache first
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached as string) as PitfallsResult;
      return parsed;
    }
  }

  // Fetch rejected PRs
  const rejectedPRs = await fetchRejectedPRs(octokit, owner, repo);

  // no rejected community PRs
  if (rejectedPRs.length === 0) {
    const emptyResult: PitfallsResult = {
      analyses: [],
      patterns: [],
      analyzedCount: 0,
      spammers: [],
    };
    return emptyResult;
  }

  // Fetch details for each PR in parallel
  const detailsPromises = rejectedPRs.map((pr) => {
    return getPRDetails(octokit, owner, repo, pr.number);
  });
  const allDetails = await Promise.all(detailsPromises);

  // Combine PR basic info with details
  const prsWithDetails: RejectedPRDetails[] = rejectedPRs.map((pr, index) => {
    return {
      number: pr.number,
      title: pr.title,
      files: allDetails[index].files,
      reviews: allDetails[index].reviews,
      lineComments: allDetails[index].lineComments,
    };
  });

  // Detect spammers and separate from legitimate PRs
  const spammers: SpammerProfile[] = [];
  const legitimatePRs: RejectedPRDetails[] = [];

  for (let i = 0; i < prsWithDetails.length; i++) {
    const pr = prsWithDetails[i];
    const originalPR = rejectedPRs[i];
    const spamCheck = detectSpam(
      {
        number: pr.number,
        title: pr.title,
        user: originalPR.user,
      },
      pr.files
    );

    if (spamCheck.isSpam) {
      spammers.push({
        username: originalPR.user?.login ?? "unknown",
        avatarUrl: originalPR.user?.avatar_url ?? "",
        prNumber: pr.number,
        reason: spamCheck.reason,
      });
    } else {
      legitimatePRs.push(pr);
    }
  }

  // no reviews or comments to analyze on legitimate PRs
  const hasContent = legitimatePRs.some((pr) => {
    return pr.reviews.length > 0 || pr.lineComments.length > 0;
  });

  if (!hasContent) {
    const noContentResult: PitfallsResult = {
      analyses: [],
      patterns: [
        "No review feedback found on rejected PRs - maintainers may close without comment",
      ],
      analyzedCount: 0,
      spammers,
    };
    return noContentResult;
  }

  // Fetch CONTRIBUTING.md for extra context
  const contributingGuide = await getContributingGuide(octokit, owner, repo);

  // Build prompt and call AI with legitimate PRs only
  const prompt = buildPrompt(legitimatePRs, contributingGuide, owner, repo);
  const aiResult = await analyzeWithAI(prompt);

  // Combine AI result with detected spammers
  const result: PitfallsResult = {
    ...aiResult,
    spammers,
  };

  // Cache result
  if (redis) {
    await redis.set(cacheKey, JSON.stringify(result), "EX", CACHE_TTL);
  }

  return result;
}
