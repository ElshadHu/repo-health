import OpenAI from "openai";
import type {
  FileNode,
  HealthScore,
  RepoInfo,
  EnhancedArchitectureAnalysis,
} from "@/server/types";
import { redis } from "@/lib/redis";

// Lazy initialization to avoid build-time errors
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

const SCORING_METHODOLOGY = {
  activity:
    "Commits/week × 10 (max 40pts) + Recency (30pts if <7 days, 20 if <30, 10 if <90, else 0) + Unique authors × 5 (max 30pts)",
  maintenance:
    "Issue-to-star ratio (<0.05=50pts, <0.1=40pts, <0.2=25pts, else 10pts) + Age (>365d=25pts, >180d=15pts, >90d=10pts, else 5pts) + Recent update (<30d=25pts, <90d=15pts, else 0)",
  community:
    "log10(stars+1) × 10 (max 30pts) + log10(forks+1) × 12 (max 30pts) + contributors × 4 (max 40pts)",
  documentation:
    "README (35pts) + LICENSE (25pts) + CONTRIBUTING (25pts) + CODE_OF_CONDUCT (15pts)",
};

export async function analyzeArchitecture(
  files: FileNode[],
  keyFilesContents: Record<string, string>,
  owner: string,
  repo: string,
  healthScore?: HealthScore,
  repoInfo?: RepoInfo,
  isAuthenticated?: boolean
): Promise<EnhancedArchitectureAnalysis> {
  // Check cache first - SECURITY: Include auth in cache key to isolate private repo data
  const cacheKey = `overview:v2:${owner}:${repo}${isAuthenticated ? ":auth" : ""}`;
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as EnhancedArchitectureAnalysis;
    }
  }

  // Limit file list to reduce tokens (top 50 most important paths)
  const importantExtensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".prisma",
    ".go",
    ".py",
    ".rs",
    ".java",
    ".rb",
    ".php",
    ".cs",
    ".csproj",
    ".sln",
    ".cshtml",
    ".swift",
    ".kt",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".lua",
    ".sh",
  ];
  const limitedFiles = files
    .filter((f) => importantExtensions.some((ext) => f.path.endsWith(ext)))
    .slice(0, 50);
  const fileList = limitedFiles.map((f) => f.path).join("\n");

  // Only include essential package.json fields
  let packageInfo = "{}";
  try {
    const pkg = JSON.parse(keyFilesContents["package.json"] || "{}");
    packageInfo = JSON.stringify({
      name: pkg.name,
      dependencies: pkg.dependencies
        ? Object.keys(pkg.dependencies).slice(0, 15)
        : [],
      devDependencies: pkg.devDependencies
        ? Object.keys(pkg.devDependencies).slice(0, 10)
        : [],
    });
  } catch {
    /* ignore */
  }

  let prompt = `Analyze repo ${owner}/${repo}.\n\nFILES (${limitedFiles.length}):\n${fileList}\n\nPACKAGE: ${packageInfo}\n\n`;
  if (healthScore && repoInfo) {
    prompt += `HEALTH SCORES (formula-based):
- Overall: ${healthScore.overallScore}/100
- Activity: ${healthScore.breakdown.activityScore}/100 (weight: 30%)
- Maintenance: ${healthScore.breakdown.maintenanceScore}/100 (weight: 25%)
- Community: ${healthScore.breakdown.communityScore}/100 (weight: 20%)
- Documentation: ${healthScore.breakdown.documentationScore}/100 (weight: 25%)
FORMULAS:
- Activity: ${SCORING_METHODOLOGY.activity}
- Maintenance: ${SCORING_METHODOLOGY.maintenance}
- Community: ${SCORING_METHODOLOGY.community}
- Documentation: ${SCORING_METHODOLOGY.documentation}
METRICS:
- Stars: ${repoInfo.stars}, Forks: ${repoInfo.forks}, Issues: ${repoInfo.openIssues}
- Updated: ${repoInfo.updatedAt}, Created: ${repoInfo.createdAt}
`;
  }
  prompt += `Return JSON (IMPORTANT: all paths MUST be from the file list above, not descriptions):
{
  "type": "monolith|monorepo|library",
  "stack": ["tech"],
  "layers": {"name": "desc"},
  "entryPoints": [{"path": "exact/path/from/list.ext", "description": "what it does"}],
  "keyFiles": [{"path": "exact/path/from/list.ext", "purpose": "what it does"}],
  "whereToLook": {"feature": ["exact/paths/from/list"]}${
    healthScore
      ? `,
  "scoreInsights": {
    "summary": "1-2 sentence project health overview",
    "breakdown": {
      "activity": {"score": ${healthScore.breakdown.activityScore}, "reason": "why", "suggestion": "how to improve or null"},
      "maintenance": {"score": ${healthScore.breakdown.maintenanceScore}, "reason": "why", "suggestion": "or null"},
      "community": {"score": ${healthScore.breakdown.communityScore}, "reason": "why", "suggestion": "or null"},
      "documentation": {"score": ${healthScore.breakdown.documentationScore}, "reason": "why", "suggestion": "or null"}
    },
    "adjustment": {"shouldAdjust": true/false, "amount": -20 to +20, "reason": "why", "confidence": "low|medium|high"},
    "recommendations": ["action 1", "action 2", "action 3"]
  }`
      : ""
  }
}`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content || "{}";
  const analysis = JSON.parse(content) as EnhancedArchitectureAnalysis;

  // Cache the result
  if (redis) {
    await redis.set(cacheKey, JSON.stringify(analysis), "EX", CACHE_TTL);
  }

  return analysis;
}
