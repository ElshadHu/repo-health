import type { CriticalIssue, SetupFilesResult } from "../../types/setup";

export function analyzeGo(files: SetupFilesResult): CriticalIssue[] {
  const issues: CriticalIssue[] = [];
  if (!files.goMod) return issues;
  const versionMatch = files.goMod.match(/^go\s+(\d+\.\d+(?:\.\d+)?)/m);
  if (versionMatch) {
    issues.push({
      id: "go-version",
      type: "environment",
      severity: "critical",
      title: `Go ${versionMatch[1]}+ required`,
      description: `This project requires Go version ${versionMatch[1]} or higher`,
      solution: {
        command: "go version",
      },
    });
  }

  const hasMakeFile = !!files.makefile;
  if (hasMakeFile) {
    issues.push({
      id: "go-makefile",
      type: "configuration",
      severity: "info",
      title: "Makefile detected",
      description: "This project uses a Makefile for build automation",
      solution: {
        command: "make",
      },
    });
  }
  return issues;
}

export function getGoQuickStartCommands(files: SetupFilesResult): string[] {
  const commands: string[] = [];
  if (!files.goMod) return commands;

  if (files.makefile) {
    // Check for common make targets in the makefile
    const makefile = files.makefile.toLowerCase();
    if (makefile.includes("run:") || makefile.includes("dev:")) {
      commands.push("make run");
    } else if (makefile.includes("build:")) {
      commands.push("make build");
    } else {
      commands.push("make");
    }
  } else {
    // Standard Go commands
    commands.push("go mod download");

    // Check README for entry point hints
    const readme = files.readme?.toLowerCase() || "";
    if (readme.includes("cmd/")) {
      commands.push("go run ./cmd/...");
    } else {
      commands.push("go run .");
    }
  }
  return commands;
}

export function getGoSetupSteps(files: SetupFilesResult): string[] {
  const steps: string[] = [];
  const issues = analyzeGo(files);
  const goVersionIssue = issues.find((i) => i.id === "go-version");
  if (goVersionIssue) {
    const version = files.goMod?.match(/^go\s+(\d+\.\d+)/m)?.[1] || "";
    steps.push(`Install Go ${version}+ (required)`);
  }
  steps.push("Download dependencies with go mod download");
  if (files.makefile) {
    steps.push("Build the project with make");
  } else {
    steps.push("Build the project with go build");
  }
  if (files.readme?.toLowerCase().includes("test")) {
    steps.push("Run tests with go test ./...");
  }
  return steps;
}
