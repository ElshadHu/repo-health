import OpenAI from "openai";
import type { FileNode, ArchitectureAnalysis } from "@/server/types";
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

export async function analyzeArchitecture(
  files: FileNode[],
  keyFilesContents: Record<string, string>,
  owner: string,
  repo: string
): Promise<ArchitectureAnalysis> {
  // Check cache first
  const cacheKey = `overview:${owner}:${repo}`;
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as ArchitectureAnalysis;
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

  const prompt = `Analyze repo ${owner}/${repo}. Files (${limitedFiles.length}):\n${fileList}\n\nPackage: ${packageInfo}\n\nReturn JSON: {"type":"monolith|monorepo|library","stack":["tech"],"layers":{"name":"paths"},"entryPoints":[{"path":"","description":""}],"keyFiles":[{"path":"","purpose":""}],"whereToLook":{"feature":["paths"]}}`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content || "{}";
  const analysis = JSON.parse(content) as ArchitectureAnalysis;

  // Cache the result
  if (redis) {
    await redis.set(cacheKey, JSON.stringify(analysis), "EX", CACHE_TTL);
  }

  return analysis;
}
