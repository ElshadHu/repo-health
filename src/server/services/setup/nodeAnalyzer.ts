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
