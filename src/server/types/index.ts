export * from "./contributor";
export * from "./funding";
export * from "./banger";
export * from "./setup";
export * from "./prTypes";

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

// Issue Analysis Types
export type IssueInfo = {
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  url: string;
  author: string;
  authorAvatar: string | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  commentsCount: number;
  reactions: number;
  assignees: string[];
  milestone: string | null;
  isPullRequest: boolean;
};

export type CrackabilityScore = {
  overall: number; // 1-100
  difficulty: "easy" | "medium" | "hard" | "expert";
  estimatedHours: number;
  factors: {
    documentationQuality: number; // 0-25
    codebaseScope: number; // 0-25
    testingRequired: number; // 0-25
    dependencyComplexity: number; // 0-25
  };
  filesLikelyTouched: string[];
  reasoning: string;
};

export type IssuePathway = {
  level: "beginner" | "intermediate" | "advanced";
  topic: string;
  issues: { number: number; title: string; url: string }[];
};

export type HiddenGem = {
  number: number;
  title: string;
  url: string;
  reason: string;
  impactScore: number;
  engagementScore: number;
  staleDays: number;
};

export type HotIssue = {
  number: number;
  title: string;
  url: string;
  hotScore: number;
  recentComments: number;
  recentReactions: number;
  hasSecurityKeyword: boolean;
};

export type IssueStats = {
  total: number;
  open: number;
  closed: number;
  avgCloseTimeHours: number;
  medianCloseTimeHours: number;
  issues: IssueInfo[];
  crackabilityScores: Record<number, CrackabilityScore>;
  pathways: IssuePathway[];
  hiddenGems: HiddenGem[];
  hotIssues: HotIssue[];
  goodFirstIssues: number;
  helpWantedIssues: number;
};

export type ArchitectureAnalysis = {
  type: "monolith" | "monorepo" | "microservices";
  stack: string[];
  layers: Record<string, string>;
  entryPoints: { path: string; description: string }[];
  keyFiles: { path: string; purpose: string }[];
  whereToLook: Record<string, string[]>;
};
export type FileNode = {
  path: string;
  type: "blob" | "tree";
  size?: number;
};
export type ProjectOverview = {
  analysis: ArchitectureAnalysis;
  fileCount: number;
  totalSize: number;
};

export type IssueReference = {
  number: number;
  title: string;
  url: string;
  labels: string[];
  isMultiFile: boolean;
  relatedFiles: string[];
};

export type FileIssueMapping = {
  [filePath: string]: {
    description: string | null;
    issues: IssueReference[];
  };
};

export type ScoreBreakdownExplanation = {
  score: number;
  reason: string;
  suggestion?: string;
};

export type ScoreAdjustment = {
  shouldAdjust: boolean;
  amount: number; // -20 to +20
  reason: string;
  confidence: "low" | "medium" | "high";
};

export type ScoreInsights = {
  summary: string;
  breakdown: {
    activity: ScoreBreakdownExplanation;
    maintenance: ScoreBreakdownExplanation;
    community: ScoreBreakdownExplanation;
    documentation: ScoreBreakdownExplanation;
  };
  adjustment: ScoreAdjustment;
  recommendations: string[];
};

export type EnhancedArchitectureAnalysis = ArchitectureAnalysis & {
  scoreInsights: ScoreInsights;
};
