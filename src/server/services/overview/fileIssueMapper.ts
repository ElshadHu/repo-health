import OpenAI from "openai";
import type {
  IssueInfo,
  FileNode,
  IssueReference,
  FileIssueMapping,
} from "@/server/types";
import { redis } from "@/lib/redis";

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

const CACHE_TTL = 60 * 60 * 24; // 24 hours

const FILE_PATTERN =
  /[\w\-\/\.]+\.(ts|tsx|js|jsx|py|go|rs|java|cpp|c|h|md|json|yaml|yml|css|scss|html)/gi;

function extractFilePaths(text: string): string[] {
  if (!text) {
    return [];
  }
  const matches = text.match(FILE_PATTERN) || [];
  const cleaned = matches.map((m) =>
    m.replace(/^\.\//, "").replace(/^\/+/, "")
  );
  return [...new Set(cleaned)];
}

type AIEnhancement = {
  fileDescriptions: Record<string, string>;
  inferredMappings: Record<string, string[]>; // issueNumber (string) -> file paths
};

type AIEnhanceOptions = {
  regexMapping: FileIssueMapping;
  fileTree: FileNode[];
  unmappedIssues: IssueInfo[];
  repoInfo: { owner: string; repo: string };
};

async function enhanceWithAI(
  options: AIEnhanceOptions
): Promise<AIEnhancement> {
  const { regexMapping, fileTree, unmappedIssues, repoInfo } = options;
  const { owner, repo } = repoInfo;

  // Check cache first
  const cacheKey = `file-issue-ai:${owner}:${repo}`;
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as AIEnhancement;
    }
  }

  // Token-efficient: only send what's needed
  const filePaths = fileTree.slice(0, 80).map((f) => f.path);
  const mappedFiles = Object.keys(regexMapping).slice(0, 30);
  const issueSummaries = unmappedIssues.slice(0, 15).map((i) => ({
    n: i.number,
    t: i.title.slice(0, 100),
    l: i.labels.slice(0, 2),
  }));

  const prompt = `Analyze repo ${owner}/${repo}:

FILES (${filePaths.length}):
${filePaths.join("\n")}

FILES WITH ISSUES (generate 1-sentence descriptions):
${mappedFiles.join("\n")}

UNMAPPED ISSUES (infer related files):
${JSON.stringify(issueSummaries)}

Return JSON:
{"fileDescriptions":{"path":"short description"},"inferredMappings":{"issueNum":["path1","path2"]}}

Rules: descriptions max 12 words, infer max 3 files per issue, use exact paths from FILES list.`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content) as AIEnhancement;

    // Cache the result
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), "EX", CACHE_TTL);
    }

    return result;
  } catch (error) {
    console.error("AI enhancement failed:", error);
    return { fileDescriptions: {}, inferredMappings: {} };
  }
}

type MapOptions = {
  issues: IssueInfo[];
  fileTree: FileNode[];
  repoInfo: { owner: string; repo: string };
  useAI?: boolean;
};

export async function mapIssuesToFiles(
  options: MapOptions
): Promise<FileIssueMapping> {
  const { issues, fileTree, repoInfo, useAI = true } = options;
  const { owner, repo } = repoInfo;
  const mapping: FileIssueMapping = {};
  const knownPaths = new Set(fileTree.map((f) => f.path));

  const issueToFiles = new Map<number, string[]>();

  for (const issue of issues) {
    const searchText = `${issue.title} ${issue.body || ""}`;
    const mentionedFiles = extractFilePaths(searchText);
    const validPaths = mentionedFiles.filter((p) => {
      if (knownPaths.has(p)) {
        return true;
      }
      return [...knownPaths].some(
        (known) => known.endsWith(p) || known.endsWith(`/${p}`)
      );
    });
    if (validPaths.length > 0) {
      issueToFiles.set(issue.number, validPaths);
    }
  }

  for (const file of fileTree) {
    if (file.type !== "blob") {
      continue;
    }
    const relatedIssues: IssueReference[] = [];
    for (const issue of issues) {
      const affectedFiles = issueToFiles.get(issue.number) || [];
      const isRelated = affectedFiles.some(
        (p) =>
          file.path === p ||
          file.path.endsWith(p) ||
          file.path.endsWith(`/${p}`)
      );
      if (isRelated) {
        const otherFiles = affectedFiles.filter(
          (f) =>
            f !== file.path &&
            !file.path.endsWith(f) &&
            !file.path.endsWith(`/${f}`)
        );
        relatedIssues.push({
          number: issue.number,
          title: issue.title,
          url: issue.url,
          labels: issue.labels,
          isMultiFile: affectedFiles.length > 1,
          relatedFiles: otherFiles,
        });
      }
    }
    if (relatedIssues.length > 0) {
      mapping[file.path] = {
        description: null,
        issues: relatedIssues,
      };
    }
  }

  if (!useAI) {
    return mapping;
  }

  // Find issues that weren't mapped by regex
  const mappedIssueNumbers = new Set(
    Object.values(mapping).flatMap((m) => m.issues.map((i) => i.number))
  );
  const unmappedIssues = issues.filter(
    (i) => i.state === "open" && !mappedIssueNumbers.has(i.number)
  );
  if (Object.keys(mapping).length === 0 && unmappedIssues.length === 0) {
    return mapping;
  }

  const aiEnhancement = await enhanceWithAI({
    regexMapping: mapping,
    fileTree,
    unmappedIssues,
    repoInfo: { owner, repo },
  });

  for (const [path, desc] of Object.entries(aiEnhancement.fileDescriptions)) {
    if (mapping[path]) {
      mapping[path].description = desc;
    }
  }
  for (const [issueNumStr, files] of Object.entries(
    aiEnhancement.inferredMappings
  )) {
    const issueNum = parseInt(issueNumStr);
    const issue = issues.find((i) => i.number === issueNum);
    if (!issue) continue;

    for (const filePath of files) {
      if (!knownPaths.has(filePath)) continue;

      if (!mapping[filePath]) {
        mapping[filePath] = { description: null, issues: [] };
      }

      // Avoid duplicates
      if (!mapping[filePath].issues.some((i) => i.number === issueNum)) {
        mapping[filePath].issues.push({
          number: issue.number,
          title: issue.title,
          url: issue.url,
          labels: issue.labels,
          isMultiFile: files.length > 1,
          relatedFiles: files.filter((f) => f !== filePath),
        });
      }
    }
  }

  return mapping;
}
