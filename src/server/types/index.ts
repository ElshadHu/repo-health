// GitHub API response types used across services

export type RepoInfo = {
  name: string;
  owner: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  openIssues: number;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
};

export type Commit = {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
};

export type Contributor = {
  username: string | undefined;
  avatarUrl: string | undefined;
  contributions: number;
  url: string | undefined;
};

export type CommunityHealth = {
  hasReadme: boolean;
  hasLicense: boolean;
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
  healthPercentage: number;
};

export type RateLimitStatus = {
  limit: number;
  remaining: number;
  reset: Date;
};

// Health score types
export type HealthScore = {
  overallScore: number;
  breakdown: {
    activityScore: number;
    maintenanceScore: number;
    communityScore: number;
    documentationScore: number;
  };
};

export type Vulnerability = {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  fixedVersion?: string;
};

export type DependencyInfo = {
  name: string;
  version: string;
  vulnerabilities: Vulnerability[];
};

export type DependenciesResult = {
  dependencies: DependencyInfo[];
  devDependencies: DependencyInfo[];
  summary: {
    total: number;
    vulnerable: number;
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
};

export type RelatedPRs = {
  repo: string;
  prNumber: number;
  title: string;
  url: string;
  status: "merged" | "open" | "closed";
  mergedAt: string;
};

export type IssueCheckResult = {
  exists: boolean;
  url?: string;
  title?: string;
  state?: "open" | "closed";
};

export type Ecosystem = "npm" | "PyPI" | "Go" | "crates.io" | "Maven";
