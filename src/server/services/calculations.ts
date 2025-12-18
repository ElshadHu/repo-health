import { RepoInfo, Commit, Contributor, CommunityHealth } from "../types";

// Scoring Weights
export const WEIGHTS = {
  ACTIVITY: 0.3,
  MAINTENANCE: 0.25,
  COMMUNITY: 0.2,
  DOCUMENTATION: 0.25,
} as const;

const ACTIVITY = {
  MAX_COMMIT_SCORE: 40,
  MAX_RECENCY_SCORE: 30,
  MAX_AUTHOR_SCORE: 30,
  WEEKS_IN_90_DAYS: 13,
  FRESH_DAYS: 7,
  RECENT_DAYS: 30,
  STALE_DAYS: 90,
} as const;

const DOCS = {
  README: 35,
  LICENSE: 25,
  CONTRIBUTING: 25,
  CODE_OF_CONDUCT: 15,
} as const;

const MS_PER_DAY = 86400000;

export function calculateActivityScore(
  commits: Commit[],
  repoInfo: RepoInfo
): number {
  // Commits per week (0-40 pts)
  const commitsPerWeek = commits.length / ACTIVITY.WEEKS_IN_90_DAYS;
  const commitScore = Math.min(ACTIVITY.MAX_COMMIT_SCORE, commitsPerWeek * 10);
  // Recency (0-30 pts)
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(repoInfo.updatedAt).getTime()) / MS_PER_DAY
  );
  const recencyScore =
    daysSinceUpdate <= ACTIVITY.FRESH_DAYS
      ? ACTIVITY.MAX_RECENCY_SCORE
      : daysSinceUpdate <= ACTIVITY.RECENT_DAYS
        ? 20
        : daysSinceUpdate <= ACTIVITY.STALE_DAYS
          ? 10
          : 0;
  // Unique authors (0-30 pts)
  const uniqueAuthors = new Set(commits.map((c) => c.author)).size;
  const authorScore = Math.min(ACTIVITY.MAX_AUTHOR_SCORE, uniqueAuthors * 5);
  return Math.min(100, Math.round(commitScore + recencyScore + authorScore));
}
// CHAOSS metrics inspired
export function calculateMaintenanceScore(repoInfo: RepoInfo): number {
  // Issue to star ratio (0-50 pts)
  const issueRatio =
    repoInfo.stars > 0 ? repoInfo.openIssues / repoInfo.stars : 0;
  const issueScore =
    issueRatio < 0.05 ? 50 : issueRatio < 0.1 ? 40 : issueRatio < 0.2 ? 25 : 10;
  // Project age (0-25 pts)
  const ageInDays = Math.floor(
    (Date.now() - new Date(repoInfo.createdAt).getTime()) / MS_PER_DAY
  );
  const ageScore =
    ageInDays > 365 ? 25 : ageInDays > 180 ? 15 : ageInDays > 90 ? 10 : 5;
  // Recently active (0-25 pts)
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(repoInfo.updatedAt).getTime()) / MS_PER_DAY
  );
  const activeScore =
    daysSinceUpdate <= 30 ? 25 : daysSinceUpdate <= 90 ? 15 : 0;
  return Math.min(100, issueScore + ageScore + activeScore);
}

// Logarithmic scaling for stars/ forks
export function calculateCommunityScore(
  repoInfo: RepoInfo,
  contributors: Contributor[]
): number {
  const starScore = Math.min(30, Math.log10(repoInfo.stars + 1) * 10);
  const forkScore = Math.min(30, Math.log10(repoInfo.forks + 1) * 12);
  const contributorScore = Math.min(40, contributors.length * 4);
  return Math.round(Math.min(100, starScore + forkScore + contributorScore));
}

export function calculateDocumentationScore(
  community: CommunityHealth
): number {
  let score: number = 0;
  if (community.hasReadme) score += DOCS.README;
  if (community.hasLicense) score += DOCS.LICENSE;
  if (community.hasContributing) score += DOCS.CONTRIBUTING;
  if (community.hasCodeOfConduct) score += DOCS.CODE_OF_CONDUCT;
  return score;
}
