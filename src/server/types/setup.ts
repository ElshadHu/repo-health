export type CriticalIssue = {
  id: string;
  type: "dependency" | "environment" | "configuration" | "platform";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  solution: {
    command?: string;
  };
};

export type SetupInsights = {
  criticalIssues: CriticalIssue[];
  dosDonts: {
    dos: { text: string }[];
    donts: { text: string }[];
  };
  dataSource: {
    type: "estimated" | "ci-analyzed";
    ciRunsAnalyzed: number;
  };
  quickStart?: {
    command: string;
  };
  setupSteps?: string[];
};

export type Ecosystem =
  | "node"
  | "python"
  | "go"
  | "rust"
  | "csharp"
  | "cpp"
  | "unknown";

export type SetupFilesResult = {
  ecosystem: Ecosystem;
  contributing: string | null;
  readme: string | null;
  envExample: string | null;
  packageJson: Record<string, unknown> | null;
  nvmrc: string | null;
  requirementsTxt: string | null;
  pyprojectToml: string | null;
  goMod: string | null;
  cargoToml: string | null;
  globalJson: string | null;
  cmakeLists: string | null;
  vcpkgJson: string | null;
  makefile: string | null;
  dockerCompose: string | null;
  toolVersions: string | null;
  primaryLanguage: string | null;
  latestCommit: { hash: string; date: string } | null;
};
