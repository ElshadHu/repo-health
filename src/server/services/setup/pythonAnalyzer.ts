// Python ecosystem analysis

import type { CriticalIssue, SetupFilesResult } from "../../types/setup";

export function analyzePython(files: SetupFilesResult): CriticalIssue[] {
  const issues: CriticalIssue[] = [];

  // Python version
  if (files.pyprojectToml) {
    const match = files.pyprojectToml.match(
      /python\s*[=<>!]+\s*["']?([^"'\n]+)/i
    );
    if (match) {
      issues.push({
        id: "python-version",
        type: "environment",
        severity: "critical",
        title: `Python ${match[1]} required`,
        description: `This project requires Python ${match[1]}`,
        solution: {
          command: "pyenv install",
        },
      });
    }
  }

  // Virtual environment
  issues.push({
    id: "python-venv",
    type: "configuration",
    severity: "warning",
    title: "Use a virtual environment",
    description: "Always use a virtual environment for Python projects",
    solution: {
      command: "python -m venv venv && source venv/bin/activate",
    },
  });

  return issues;
}
