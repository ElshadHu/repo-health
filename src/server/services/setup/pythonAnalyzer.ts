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

export function getPythonQuickStartCommands(files: SetupFilesResult): string[] {
  const commands: string[] = [];

  if (files.pyprojectToml) {
    commands.push("poetry install", "poetry run python main.py");
  } else if (files.requirementsTxt) {
    commands.push("pip install -r requirements.txt", "python main.py");
  }

  return commands;
}

export function getPythonSetupSteps(files: SetupFilesResult): string[] {
  const steps: string[] = [];
  const issues = analyzePython(files);

  // Step 1: Python version requirement (prerequisite, comes first)
  const pythonVersionIssue = issues.find((i) => i.id === "python-version");
  if (pythonVersionIssue) {
    steps.push(pythonVersionIssue.title);
  }

  // Step 2: Virtual environment
  const venvIssue = issues.find((i) => i.id === "python-venv");
  if (venvIssue) {
    steps.push("Create and activate virtual environment");
  }

  // Step 3: Install dependencies
  if (files.pyprojectToml) {
    steps.push("Install dependencies with poetry");
  } else if (files.requirementsTxt) {
    steps.push("Install dependencies with pip");
  }

  // Step 4: Run the application (if applicable)
  if (files.readme?.toLowerCase().includes("main.py")) {
    steps.push("Run the application");
  }

  return steps;
}
