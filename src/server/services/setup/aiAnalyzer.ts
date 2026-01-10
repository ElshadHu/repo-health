// AI-powered setup analysis for Dos/Don'ts and time estimates

import OpenAI from "openai";
import { redis } from "@/lib/redis";
import type { SetupFilesResult, CriticalIssue } from "../../types/setup";

let openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY required");
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

const CACHE_TTL = 60 * 60 * 24;

type AISetupResult = {
  dos: string[];
  donts: string[];
  timeAdjustment: number;
  timeReason: string;
};

export async function analyzeSetupWithAI(
  owner: string,
  repo: string,
  files: SetupFilesResult,
  issues: CriticalIssue[]
): Promise<AISetupResult> {
  const cacheKey = ["setup-ai", owner, repo].join(":");

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as AISetupResult;
  }

  const context = buildContext(files, issues);
  const prompt = buildPrompt(context);

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content) as AISetupResult;

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), "EX", CACHE_TTL);
    }

    return result;
  } catch {
    return {
      dos: [],
      donts: [],
      timeAdjustment: 0,
      timeReason: "",
    };
  }
}

function buildContext(
  files: SetupFilesResult,
  issues: CriticalIssue[]
): string[] {
  const lines: string[] = [];

  lines.push("ECOSYSTEM: " + files.ecosystem);
  lines.push("ISSUES_COUNT: " + issues.length);

  if (files.contributing) {
    const contrib = files.contributing.slice(0, 1500);
    lines.push("CONTRIBUTING.md:", contrib);
  }

  if (files.readme) {
    const readme = files.readme.slice(0, 1000);
    lines.push("README (excerpt):", readme);
  }

  if (files.dockerCompose) {
    lines.push("HAS_DOCKER: yes");
  }

  if (files.envExample) {
    const envCount = files.envExample
      .split("\n")
      .filter((l) => l.includes("=")).length;
    lines.push("ENV_VARS_COUNT: " + envCount);
  }

  const issueList = issues.map((i) => i.title).join(", ");
  lines.push("DETECTED_ISSUES: " + issueList);

  return lines;
}

function buildPrompt(context: string[]): string {
  const parts = [
    "Analyze this repo setup and provide helpful tips.",
    "",
    "CONTEXT:",
    context.join("\n"),
    "",
    "Return JSON:",
    "{",
    '  "dos": ["3-5 specific dos for contributors based on CONTRIBUTING.md"],',
    '  "donts": ["3-5 specific donts based on common mistakes for this stack"]',
    "}",
    "",
    "Keep tips short and actionable. Base them on actual project context, not generic advice.",
  ];

  return parts.join("\n");
}
