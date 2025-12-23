import OpenAI from "openai";
import type { FileNode, ArchitectureAnalysis } from "@/server/types";
import { redis } from "@/lib/redis";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  const fileList = files.map((f) => f.path).join("\n");
  const packageJson = keyFilesContents["package.json"] || "{}";

  const prompt = `Analyze this GitHub repository structure and return a JSON object.

Repository: ${owner}/${repo}

File tree (${files.length} files):
${fileList}

package.json:
${packageJson.slice(0, 2000)}

Return ONLY valid JSON with this exact structure:
{
  "type": "monolith",
  "stack": ["Next.js", "React", "TypeScript"],
  "layers": {
    "frontend": "src/app/, src/components/",
    "backend": "src/server/"
  },
  "entryPoints": [
    {"path": "src/app/page.tsx", "description": "Main entry point"}
  ],
  "keyFiles": [
    {"path": "package.json", "purpose": "Dependencies and scripts"}
  ],
  "whereToLook": {
    "authentication": ["src/lib/auth.ts"],
    "database": ["prisma/schema.prisma"]
  }
}`;

  const response = await openai.chat.completions.create({
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
