// Main Setup Insights Analyzer

import { fetchSetupFiles } from "./setupFiles";
import { parseContributing, parseEnvExample } from "./parsers";
import {
  analyzeNode,
  getNodeQuickStartCommands,
  getNodeSetupSteps,
} from "./nodeAnalyzer";
import {
  analyzePython,
  getPythonQuickStartCommands,
  getPythonSetupSteps,
} from "./pythonAnalyzer";
import {
  analyzeDocker,
  getDockerQuickStartCommands,
  getDockerSetupSteps,
} from "./dockerAnalyzer";
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

  // AI analysis for smart Dos/Don'ts
  const aiResult = await analyzeSetupWithAI(owner, repo, files, criticalIssues);

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

  // Generate Quick Start command
  const quickStart = generateQuickStartCommand(files);

  // Generate Setup Steps
  const setupSteps = generateSetupSteps(files, envVars.length > 0);

  return {
    criticalIssues,
    dosDonts: { dos, donts },
    dataSource: {
      type: hasCIData ? "ci-analyzed" : "estimated",
      ciRunsAnalyzed: ciData,
    },
    quickStart,
    setupSteps,
  };
}

function generateQuickStartCommand(
  files: Awaited<ReturnType<typeof fetchSetupFiles>>
): { command: string } | undefined {
  const commands: string[] = [];

  // Add Docker commands first (if applicable)
  commands.push(...getDockerQuickStartCommands(files));

  // Add ecosystem-specific commands
  switch (files.ecosystem) {
    case "node":
      commands.push(...getNodeQuickStartCommands(files));
      break;
    case "python":
      commands.push(...getPythonQuickStartCommands(files));
      break;
  }

  return commands.length > 0 ? { command: commands.join(" && ") } : undefined;
}

function generateSetupSteps(
  files: Awaited<ReturnType<typeof fetchSetupFiles>>,
  hasEnvVars: boolean
): string[] {
  const steps: string[] = [];

  // Get ecosystem-specific steps
  let ecosystemSteps: string[] = [];
  switch (files.ecosystem) {
    case "node":
      ecosystemSteps = getNodeSetupSteps(files);
      break;
    case "python":
      ecosystemSteps = getPythonSetupSteps(files);
      break;
  }

  // Separate prerequisites from other steps
  const prerequisites = ecosystemSteps.filter(
    (s) =>
      s.includes("Install Node.js") ||
      (s.includes("Python") && s.includes("required"))
  );
  const postCloneSteps = ecosystemSteps.filter(
    (s) => !prerequisites.includes(s)
  );

  // Add prerequisites first
  steps.push(...prerequisites);

  // Clone repository
  steps.push("Clone the repository");

  // Environment variables
  if (hasEnvVars) {
    steps.push("Copy .env.example to .env and configure variables");
  }

  // Docker services
  steps.push(...getDockerSetupSteps(files));

  // Ecosystem-specific post-clone steps
  steps.push(...postCloneSteps);

  return steps;
}

export const setupService = { analyzeSetup };
