import type { CriticalIssue, SetupFilesResult } from "../../types/setup";

export function analyzeCSharp(files: SetupFilesResult): CriticalIssue[] {
  const issues: CriticalIssue[] = [];
  if (!files.globalJson) return issues;

  // Parse global.json for SDK version
  try {
    const globalConfig = JSON.parse(files.globalJson);
    const sdkVersion = globalConfig?.sdk?.version;

    if (sdkVersion) {
      issues.push({
        id: "dotnet-sdk-version",
        type: "environment",
        severity: "critical",
        title: `.NET SDK ${sdkVersion} required`,
        description: `This project requires .NET SDK version ${sdkVersion}`,
        solution: {
          command: "dotnet --version",
        },
      });
    }

    const rollForward = globalConfig?.sdk?.rollForward;
    if (rollForward) {
      issues.push({
        id: "dotnet-roll-forward",
        type: "configuration",
        severity: "info",
        title: `SDK roll-forward: ${rollForward}`,
        description: `The project uses ${rollForward} roll-forward policy for SDK versions`,
        solution: {
          command: "dotnet --list-sdks",
        },
      });
    }
  } catch {
    issues.push({
      id: "dotnet-global-json-error",
      type: "configuration",
      severity: "warning",
      title: "Invalid global.json",
      description: "Could not parse global.json file",
      solution: {
        command: "dotnet --info",
      },
    });
  }

  return issues;
}

export function getCSharpQuickStartCommands(files: SetupFilesResult): string[] {
  const commands: string[] = [];

  // Standard .NET commands
  commands.push("dotnet restore");
  commands.push("dotnet build");

  const readme = files.readme?.toLowerCase() || "";
  if (readme.includes("dotnet run")) {
    commands.push("dotnet run");
  }

  return commands;
}

export function getCSharpSetupSteps(files: SetupFilesResult): string[] {
  const steps: string[] = [];

  const issues = analyzeCSharp(files);
  const sdkIssue = issues.find((i) => i.id === "dotnet-sdk-version");

  if (sdkIssue && files.globalJson) {
    try {
      const globalConfig = JSON.parse(files.globalJson);
      const version = globalConfig?.sdk?.version || "";
      steps.push(`Install .NET SDK ${version} (required)`);
    } catch {
      steps.push("Install .NET SDK");
    }
  } else {
    steps.push("Install .NET SDK");
  }

  steps.push("Restore dependencies with dotnet restore");
  steps.push("Build the project with dotnet build");

  if (files.readme?.toLowerCase().includes("test")) {
    steps.push("Run tests with dotnet test");
  }

  return steps;
}
