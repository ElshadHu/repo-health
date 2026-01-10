// Node.js / JavaScript / TypeScript ecosystem analysis

import type { CriticalIssue, SetupFilesResult } from "../../types/setup";

export function analyzeNode(files: SetupFilesResult): CriticalIssue[] {
  const issues: CriticalIssue[] = [];
  const pkg = files.packageJson;
  if (!pkg) return issues;

  // Node version requirement
  const engines = pkg.engines as Record<string, string> | undefined;
  if (engines?.node) {
    issues.push({
      id: "node-version",
      type: "environment",
      severity: "critical",
      title: `Node.js ${engines.node} required`,
      description: `This project requires Node.js version ${engines.node}`,
      solution: {
        command: files.nvmrc ? "nvm use" : "nvm install",
      },
    });
  }

  // Package manager detection
  const hasYarn =
    files.contributing?.includes("yarn") || files.readme?.includes("yarn");
  const hasPnpm =
    files.contributing?.includes("pnpm") || files.readme?.includes("pnpm");
  const pkgManager = hasYarn ? "yarn" : hasPnpm ? "pnpm" : "npm";

  issues.push({
    id: `pkg-${pkgManager}`,
    type: "configuration",
    severity: "warning",
    title: `Use ${pkgManager} for this project`,
    description: `This project uses ${pkgManager}. Mixing package managers causes issues.`,
    solution: {
      command: `${pkgManager} install`,
    },
  });

  return issues;
}

export function getNodeQuickStartCommands(files: SetupFilesResult): string[] {
  const commands: string[] = [];
  const pkg = files.packageJson as Record<string, unknown> | null;
  if (!pkg) return commands;

  // Detect package manager
  const hasYarn =
    files.contributing?.includes("yarn") || files.readme?.includes("yarn");
  const hasPnpm =
    files.contributing?.includes("pnpm") || files.readme?.includes("pnpm");
  const pkgManager = hasYarn ? "yarn" : hasPnpm ? "pnpm" : "npm";

  // Install dependencies
  commands.push(`${pkgManager} install`);

  // Add dev/start command
  const scripts = pkg.scripts as Record<string, string> | undefined;
  if (scripts?.dev) {
    commands.push(`${pkgManager} ${pkgManager === "npm" ? "run " : ""}dev`);
  } else if (scripts?.start) {
    commands.push(`${pkgManager} ${pkgManager === "npm" ? "run " : ""}start`);
  }

  return commands;
}

export function getNodeSetupSteps(files: SetupFilesResult): string[] {
  const steps: string[] = [];
  const issues = analyzeNode(files);
  const pkg = files.packageJson as Record<string, unknown> | null;

  // Step 1: Node version requirement (prerequisite, comes first)
  const nodeVersionIssue = issues.find((i) => i.id === "node-version");
  if (nodeVersionIssue) {
    const nodeVersion = files.nvmrc || "(see package.json engines)";
    steps.push(`Install Node.js ${nodeVersion}`);
  }

  // Step 2: Package manager
  const pkgIssue = issues.find((i) => i.id.startsWith("pkg-"));
  if (pkgIssue) {
    const pkgManager = pkgIssue.id.replace("pkg-", "");
    steps.push(`Install dependencies with ${pkgManager}`);
  }

  // Step 3: Database migrations
  if (pkg?.scripts && typeof pkg.scripts === "object") {
    const scripts = pkg.scripts as Record<string, string>;
    if (
      scripts["db:migrate"] ||
      scripts["prisma:migrate"] ||
      scripts["migrate"]
    ) {
      steps.push("Run database migrations");
    }
  }

  // Step 4: Run the project
  if (pkg?.scripts && typeof pkg.scripts === "object") {
    const scripts = pkg.scripts as Record<string, string>;
    if (scripts.dev) {
      steps.push("Start the development server");
    } else if (scripts.start) {
      steps.push("Run the application");
    } else if (scripts.build) {
      steps.push("Build the project");
    }
  }

  return steps;
}
