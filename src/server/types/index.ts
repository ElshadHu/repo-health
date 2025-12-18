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
  avatarUrl: string;
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
    activity: number;
    maintenance: number;
    community: number;
    documentation: number;
  };
};
