import type { CriticalIssue, SetupFilesResult } from "../../types/setup";

export function analyzeRust(files: SetupFilesResult): CriticalIssue[] {
  const issues: CriticalIssue[] = [];
  if (!files.cargoToml) return issues;

  // Check for minimum Rust version
  const rustVersionMatch = files.cargoToml.match(
    /rust-version\s*=\s*"(\d+\.\d+(?:\.\d+)?)"/
  );
  if (rustVersionMatch) {
    issues.push({
      id: "rust-version",
      type: "environment",
      severity: "critical",
      title: `Rust ${rustVersionMatch[1]}+ required`,
      description: `This project requires Rust version ${rustVersionMatch[1]} or higher`,
      solution: {
        command: "rustc --version",
      },
    });
  }

  const editionMatch = files.cargoToml.match(/edition\s*=\s*"(\d{4})"/);
  if (editionMatch) {
    issues.push({
      id: "rust-edition",
      type: "configuration",
      severity: "info",
      title: `Rust Edition ${editionMatch[1]}`,
      description: `This project uses Rust Edition ${editionMatch[1]}`,
      solution: {
        command: "cargo --version",
      },
    });
  }

  // Check for workspace
  if (files.cargoToml.includes("[workspace]")) {
    issues.push({
      id: "rust-workspace",
      type: "configuration",
      severity: "info",
      title: "Cargo workspace detected",
      description: "This is a multi-crate workspace project",
      solution: {
        command: "cargo build --workspace",
      },
    });
  }

  return issues;
}

export function getRustQuickStartCommands(files: SetupFilesResult): string[] {
  const commands: string[] = [];
  if (!files.cargoToml) return commands;

  const isWorkspace = files.cargoToml.includes("[workspace]");

  if (isWorkspace) {
    commands.push("cargo build --workspace");
  } else {
    commands.push("cargo build");
  }

  const readme = files.readme?.toLowerCase() || "";
  if (readme.includes("cargo run")) {
    commands.push("cargo run");
  }

  return commands;
}

export function getRustSetupSteps(files: SetupFilesResult): string[] {
  const steps: string[] = [];
  if (!files.cargoToml) return steps;

  const issues = analyzeRust(files);
  const rustVersionIssue = issues.find((i) => i.id === "rust-version");

  if (rustVersionIssue) {
    const version =
      files.cargoToml.match(/rust-version\s*=\s*"(\d+\.\d+)"/)?.[1] || "";
    steps.push(`Install Rust ${version}+ via rustup (required)`);
  } else {
    steps.push("Install Rust via rustup");
  }

  const isWorkspace = files.cargoToml.includes("[workspace]");
  if (isWorkspace) {
    steps.push("Build all crates with cargo build --workspace");
  } else {
    steps.push("Build the project with cargo build");
  }

  if (files.readme?.toLowerCase().includes("test")) {
    steps.push("Run tests with cargo test");
  }

  return steps;
}
