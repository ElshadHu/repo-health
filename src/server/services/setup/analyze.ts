// Main Setup Insights Analyzer

import { fetchSetupFiles } from "./setupFiles";
import { parseContributing, parseEnvExample } from "./parsers";
import { analyzeNode } from "./nodeAnalyzer";
import { analyzePython } from "./pythonAnalyzer";
import { analyzeDocker } from "./dockerAnalyzer";
import { analyzeCIFailures } from "./ciAnalyzer";
import { analyzeSetupWithAI } from "./aiAnalyzer";
import type { SetupInsights, CriticalIssue } from "../../types/setup";

export async function analyzeSetup(
  owner: string,
  repo: string,
  token?: string | null
): Promise<SetupInsights> {
  const files = await fetchSetupFiles(owner, repo, token);
  const ciData = await analyzeCIFailures(owner, repo, token);
  const { prerequisites } = parseContributing(files.contributing);
  const envVars = parseEnvExample(files.envExample);

  let criticalIssues: CriticalIssue[] = [];
  switch (files.ecosystem) {
    case "node":
      criticalIssues = analyzeNode(files);
      break;
    case "python":
      criticalIssues = analyzePython(files);
      break;
  }

  const dockerIssues = analyzeDocker(files);
  criticalIssues.push(...dockerIssues);

  if (envVars.length > 0) {
    const envPreview = envVars.slice(0, 4).join(", ");
    const extra =
      envVars.length > 4 ? ", +" + (envVars.length - 4) + " more" : "";
    criticalIssues.push({
      id: "env-vars",
      type: "configuration",
      severity: "warning",
      title: envVars.length + " environment variables required",
      description: "Set: " + envPreview + extra,
      solution: { command: "cp .env.example .env" },
    });
  }

  const hasCIData = ciData > 0;
  const baseTime = 20 + criticalIssues.length * 5;

  // AI analysis for smart Dos/Don'ts and time adjustment
  const aiResult = await analyzeSetupWithAI(
    owner,
    repo,
    files,
    criticalIssues,
    baseTime
  );

  // Build dos from AI or fallback to parsed prerequisites
  const dos =
    aiResult.dos.length > 0
      ? aiResult.dos.map((text) => ({ text }))
      : prerequisites.slice(0, 3).map((text) => ({ text }));

  // Build donts from AI or fallback
  const donts =
    aiResult.donts.length > 0
      ? aiResult.donts.map((text) => ({ text }))
      : [
          { text: "Don't skip CONTRIBUTING.md" },
          { text: "Don't mix package managers" },
        ];

  const adjustedTime = baseTime + aiResult.timeAdjustment;

  return {
    timeEstimate: {
      totalMinutes: adjustedTime,
      breakdown: {
        install: 10,
        configuration: 5 + envVars.length,
        troubleshooting:
          criticalIssues.filter((i) => i.severity === "critical").length * 5,
        platformSpecific: 3 + Math.max(0, aiResult.timeAdjustment),
      },
      accuracy: hasCIData ? "calculated" : "estimated",
    },
    criticalIssues,
    dosDonts: { dos, donts },
    dataSource: {
      type: hasCIData ? "ci-analyzed" : "estimated",
      ciRunsAnalyzed: ciData,
    },
  };
}

export const setupService = { analyzeSetup };
