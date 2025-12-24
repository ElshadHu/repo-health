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

export type CommitWithStats = Commit & {
  additions: number;
  deletions: number;
  files: string[];
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

// OSV API raw response type  that is the expected shape
export type OSVRawVuln = {
  id: string;
  summary?: string;
  details?: string;
  database_specific?: { severity?: string };
  severity?: Array<{ score?: number; type?: string }>;
  affected?: Array<{
    ranges?: Array<{
      events?: Array<{ fixed?: string }>;
    }>;
  }>;
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

export type Ecosystem = "npm" | "PyPI" | "Go" | "crates.io" | "Conan" | "NuGet";

// Raw GitHub PR from Octokit API  the expected shape
export type GitHubPR = {
  number: number;
  title: string;
  html_url: string;
  created_at: string;
  merged_at?: string | null;
  author_association: string;
  comments?: number;
  review_comments?: number;
  user?: { login: string; type?: string } | null;
  requested_reviewers?: Array<{ login: string }> | null;
};

export type GitHubComment = {
  user?: { login: string } | null;
};

export type HotPR = {
  id: number;
  title: string;
  url: string;
  author: string;
  comments: number;
  reviewComments: number;
  reviewers: number;
  createdAt: string;
};

export type AuthorBreakdown = {
  maintainer: number;
  community: number;
  bots: number;
};

export type ConversationStats = {
  avgComments: number;
  totalComments: number;
};

export type PRStats = {
  total: number;
  open: number;
  closed: number;
  merged: number;
  avgMergeTimeHours: number;
  medianMergeTimeHours: number;
  authorBreakdown: AuthorBreakdown;
  conversationStats: ConversationStats;
  aiReviewers: string[];
  hasTemplate: boolean;
  templatePath: string | null;
  hotPRs: HotPR[];
  contributorFunnel?: ContributorFunnel;
  aiInteractionStats?: AIInteractionStats;
};

export type ContributorFunnel = {
  firstTime: number; // Contributors with 1 PR
  secondContribution: number; // Contributors with 2 PRs
  regular: number; // Contributors with 3-9 PRs
  coreTeam: number; // Contributors with 10+ PRs or maintainer status
};

// AI Bot Interaction Analytics
export type AIBotStats = {
  name: string;
  commentCount: number;
  prsReviewedCount: number;
};

export type AIInteractionStats = {
  totalAIComments: number;
  avgWrestlingTimeHours: number; // Time from AI comment to next human commit
  prsWithAIReviews: number;
  bots: AIBotStats[];
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
