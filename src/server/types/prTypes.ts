// PR-Related Types

// Raw GitHub PR from Octokit API - the expected shape
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

export type PRMergeTimeChart = {
  monthly: { month: string; avgDays: number; count: number }[];
  comparison: {
    communityAvg: number;
    maintainerAvg: number;
    diffPercent: number;
  };
  trend: { direction: "up" | "down" | "flat"; change: number };
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

// Merge Conflict Risk Types
export type ConflictRiskPR = {
  number: number;
  title: string;
  url: string;
  author: string;
  daysSinceCreated: number;
  prsMergedAfter: number; // PRs merged since this one was opened
  riskScore: number; // Calculated risk indicator
  reason?: string; // Reason for the risk
};

export type MergeConflictFairness = {
  atRiskPRs: ConflictRiskPR[]; // Top 5 highest risk
  avgWaitDays: number;
};

// Main PR Stats type
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
  mergeTimeChart?: PRMergeTimeChart;
  mergeConflictFairness?: MergeConflictFairness;
};
