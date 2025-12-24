import { cacheService } from "@/lib/redis";
import { Octokit } from "@octokit/rest";
import type {
  PRStats,
  HotPR,
  AuthorBreakdown,
  ConversationStats,
  ContributorFunnel,
  AIInteractionStats,
  AIBotStats,
  GitHubPR,
  GitHubComment,
} from "../../types";

const CACHE_TTL_SECONDS = 2 * 60 * 60;

const AI_REVIEWERS = [
  "dependabot[bot]",
  "renovate[bot]",
  "coderabbitai[bot]",
  "github-actions[bot]",
];

const MAINTAINER_ROLES = ["OWNER", "MEMBER", "COLLABORATOR"];

function createGitHubClient(token?: string | null): Octokit {
  return new Octokit({ auth: token || process.env.GITHUB_TOKEN });
}

type FetchOptions = {
  owner: string;
  repo: string;
  state: "open" | "closed";
};

async function fetchPRs(octokit: Octokit, options: FetchOptions) {
  const { owner, repo, state } = options;
  try {
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state,
      per_page: 100,
    });
    return data;
  } catch {
    return [];
  }
}

// Fetch issue comments for a PR (general comments)
async function fetchPRIssueComments(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number
) {
  try {
    const { data } = await octokit.issues.listComments({
      owner,
      repo,
      issue_number: prNumber,
      per_page: 100,
    });
    return data;
  } catch {
    return [];
  }
}

// Fetch review comments for a PR (code review comments)
async function fetchPRReviewComments(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number
) {
  try {
    const { data } = await octokit.pulls.listReviewComments({
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });
    return data;
  } catch {
    return [];
  }
}

type EnrichedPR = {
  pr: GitHubPR;
  issueComments: GitHubComment[];
  reviewComments: GitHubComment[];
};

// Fetch comments for recent PRs (limit to avoid rate limits)
async function enrichPRsWithComments(
  octokit: Octokit,
  owner: string,
  repo: string,
  prs: GitHubPR[],
  limit = 15
): Promise<EnrichedPR[]> {
  const recentPRs = prs.slice(0, limit);
  const enriched: EnrichedPR[] = [];

  for (const pr of recentPRs) {
    const [issueComments, reviewComments] = await Promise.all([
      fetchPRIssueComments(octokit, owner, repo, pr.number),
      fetchPRReviewComments(octokit, owner, repo, pr.number),
    ]);
    enriched.push({ pr, issueComments, reviewComments });
  }
  return enriched;
}

type TemplateResult = { hasTemplate: boolean; templatePath: string | null };

async function checkPRTemplate(
  octokit: Octokit,
  options: { owner: string; repo: string }
): Promise<TemplateResult> {
  const { owner, repo } = options;
  const paths = [
    ".github/PULL_REQUEST_TEMPLATE.md",
    "PULL_REQUEST_TEMPLATE.md",
  ];

  for (const path of paths) {
    try {
      await octokit.repos.getContent({ owner, repo, path });
      const found: TemplateResult = { hasTemplate: true, templatePath: path };
      return found;
    } catch {
      continue;
    }
  }
  const notFound: TemplateResult = { hasTemplate: false, templatePath: null };
  return notFound;
}

function msToHours(ms: number): number {
  return ms / (1000 * 60 * 60);
}

function getPRMergeTime(pr: GitHubPR): number {
  const created = new Date(pr.created_at).getTime();
  const merged = new Date(pr.merged_at!).getTime();
  return msToHours(merged - created);
}

function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

type MergeTimeStats = { avg: number; median: number };

function calculateMergeTime(prs: GitHubPR[]): MergeTimeStats {
  const merged = prs.filter((pr) => pr.merged_at);
  if (!merged.length) {
    const empty: MergeTimeStats = { avg: 0, median: 0 };
    return empty;
  }

  const times = merged.map(getPRMergeTime);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;

  const stats: MergeTimeStats = {
    avg: Math.round(avg),
    median: Math.round(calculateMedian(times)),
  };
  return stats;
}

function isMaintainer(pr: GitHubPR): boolean {
  return MAINTAINER_ROLES.includes(pr.author_association);
}

function isBot(pr: GitHubPR): boolean {
  return pr.user?.type === "Bot";
}

function categorizeAuthors(prs: GitHubPR[]): AuthorBreakdown {
  const maintainer = prs.filter(isMaintainer).length;
  const bots = prs.filter(isBot).length;
  const breakdown: AuthorBreakdown = {
    maintainer,
    bots,
    community: prs.length - maintainer - bots,
  };
  return breakdown;
}

function getTotalComments(pr: GitHubPR): number {
  return (pr.comments || 0) + (pr.review_comments || 0);
}

function toHotPR(pr: GitHubPR): HotPR {
  const hotPR: HotPR = {
    id: pr.number,
    title: pr.title,
    url: pr.html_url,
    author: pr.user?.login || "unknown",
    comments: pr.comments || 0,
    reviewComments: pr.review_comments || 0,
    reviewers: pr.requested_reviewers?.length || 0,
    createdAt: pr.created_at,
  };
  return hotPR;
}

function findHotPRs(prs: GitHubPR[]): HotPR[] {
  const threshold = 5;
  return prs
    .filter((pr) => getTotalComments(pr) >= threshold)
    .map(toHotPR)
    .sort(
      (a, b) => b.comments + b.reviewComments - (a.comments + a.reviewComments)
    )
    .slice(0, 5);
}

function isAIReviewer(login: string): boolean {
  const lowerLogin = login.toLowerCase();
  return AI_REVIEWERS.some((ai) =>
    lowerLogin.includes(ai.replace("[bot]", ""))
  );
}

function detectAIReviewers(prs: GitHubPR[]): string[] {
  const detected = new Set<string>();
  for (const pr of prs) {
    for (const reviewer of pr.requested_reviewers || []) {
      if (reviewer.login && isAIReviewer(reviewer.login)) {
        detected.add(reviewer.login);
      }
    }
  }
  return Array.from(detected);
}

function calculateAIInteractionStats(
  aiCommentsByBot: Map<string, { comments: number; prs: Set<number> }>
): AIInteractionStats {
  const bots: AIBotStats[] = [];
  let totalComments = 0;
  const allPRsWithAI = new Set<number>();

  for (const [name, data] of aiCommentsByBot) {
    bots.push({
      name,
      commentCount: data.comments,
      prsReviewedCount: data.prs.size,
    });
    totalComments += data.comments;
    data.prs.forEach((pr) => allPRsWithAI.add(pr));
  }

  bots.sort((a, b) => b.commentCount - a.commentCount);

  const avgWrestlingTimeHours = totalComments > 0 ? 4 : 0; // Placeholder

  return {
    totalAIComments: totalComments,
    avgWrestlingTimeHours,
    prsWithAIReviews: allPRsWithAI.size,
    bots,
  };
}

function extractAICommentStats(
  enrichedPRs: {
    pr: GitHubPR;
    issueComments: GitHubComment[];
    reviewComments: GitHubComment[];
  }[]
): Map<string, { comments: number; prs: Set<number> }> {
  const botStats = new Map<string, { comments: number; prs: Set<number> }>();

  for (const item of enrichedPRs) {
    // Only analyze community PRs (not maintainers or bots)
    const authorAssociation = item.pr.author_association;
    const isCommunityPR =
      !MAINTAINER_ROLES.includes(authorAssociation) &&
      item.pr.user?.type !== "Bot";

    if (!isCommunityPR) continue;

    const allComments = [...item.issueComments, ...item.reviewComments];
    for (const comment of allComments) {
      const author = comment.user?.login;
      if (author && isAIReviewer(author)) {
        if (!botStats.has(author)) {
          botStats.set(author, { comments: 0, prs: new Set() });
        }
        const stats = botStats.get(author)!;
        stats.comments++;
        stats.prs.add(item.pr.number);
      }
    }
  }

  return botStats;
}

/** Calculates conversation statistics from enriched PRs (with real comment counts) */
function calculateConversationStatsEnriched(
  enrichedPRs: EnrichedPR[],
  totalPRCount: number
): ConversationStats {
  const totalComments = enrichedPRs.reduce(
    (sum, item) => sum + item.issueComments.length + item.reviewComments.length,
    0
  );
  const avgComments =
    totalPRCount > 0 ? Math.round(totalComments / totalPRCount) : 0;
  return { avgComments, totalComments };
}

function calculateContributorFunnel(prs: GitHubPR[]): ContributorFunnel {
  // Count PRs per author
  const authorCounts = new Map<string, number>();
  for (const pr of prs) {
    const author = pr.user?.login;
    if (author) {
      authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
    }
  }

  // Categorize by contribution count
  let firstTime = 0;
  let secondContribution = 0;
  let regular = 0;
  let coreTeam = 0;

  for (const count of authorCounts.values()) {
    if (count === 1) firstTime++;
    else if (count === 2) secondContribution++;
    else if (count >= 3 && count <= 9) regular++;
    else if (count >= 10) coreTeam++;
  }

  return { firstTime, secondContribution, regular, coreTeam };
}

type AnalyzeOptions = {
  owner: string;
  repo: string;
  token?: string | null;
};

export async function analyze(options: AnalyzeOptions): Promise<PRStats> {
  const { owner, repo, token } = options;

  const cacheKey = `prs:${owner}:${repo}`;
  const cached = await cacheService.get<PRStats>(cacheKey);
  if (cached) {
    return cached;
  }

  const octokit = createGitHubClient(token);
  const [openPRs, closedPRs, template] = await Promise.all([
    fetchPRs(octokit, { owner, repo, state: "open" }),
    fetchPRs(octokit, { owner, repo, state: "closed" }),
    checkPRTemplate(octokit, { owner, repo }),
  ]);

  const allPRs = [...openPRs, ...closedPRs];
  const mergedPRs = closedPRs.filter((pr) => pr.merged_at);
  const mergeTimeStats = calculateMergeTime(closedPRs);

  const enrichedPRs = await enrichPRsWithComments(
    octokit,
    owner,
    repo,
    allPRs,
    20
  );

  const aiCommentStats = extractAICommentStats(enrichedPRs);
  const aiInteractionStats = calculateAIInteractionStats(aiCommentStats);

  const stats: PRStats = {
    total: allPRs.length,
    open: openPRs.length,
    closed: closedPRs.length,
    merged: mergedPRs.length,
    avgMergeTimeHours: mergeTimeStats.avg,
    medianMergeTimeHours: mergeTimeStats.median,
    authorBreakdown: categorizeAuthors(allPRs),
    conversationStats: calculateConversationStatsEnriched(
      enrichedPRs,
      allPRs.length
    ),
    aiReviewers: detectAIReviewers(allPRs),
    hotPRs: findHotPRs(allPRs),
    hasTemplate: template.hasTemplate,
    templatePath: template.templatePath,
    contributorFunnel: calculateContributorFunnel(allPRs),
    aiInteractionStats,
  };

  await cacheService.set(cacheKey, stats, CACHE_TTL_SECONDS);
  return stats;
}

export const prService = { analyze };
