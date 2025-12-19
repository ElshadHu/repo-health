import { githubService } from "./github";
import { cacheService } from "@/lib/redis";
import { HealthScore } from "../types";
import {
  calculateActivityScore,
  calculateMaintenanceScore,
  calculateCommunityScore,
  calculateDocumentationScore,
  WEIGHTS,
} from "./calculations";

const CACHE_TTL = 3600; // 1 hour

export async function calculateHealthScore(
  owner: string,
  repo: string,
  accessToken?: string | null
): Promise<HealthScore> {
  // Check cache first
  const cacheKey = `health-score:${owner}:${repo}${accessToken ? ":auth" : ""}`;
  const cached = await cacheService.get<HealthScore>(cacheKey);
  if (cached) {
    return cached;
  }
  const [repoInfo, commits, contributors, community] = await Promise.all([
    githubService.getRepoInfo(owner, repo, accessToken),
    githubService.getCommits(owner, repo, accessToken),
    githubService.getContributors(owner, repo, accessToken),
    githubService.getCommunityHealth(owner, repo, accessToken),
  ]);

  const activityScore = calculateActivityScore(commits, repoInfo);
  const maintenanceScore = calculateMaintenanceScore(repoInfo);
  const communityScore = calculateCommunityScore(repoInfo, contributors);
  const documentationScore = calculateDocumentationScore(community);

  const overallScore = Math.round(
    activityScore * WEIGHTS.ACTIVITY +
      maintenanceScore * WEIGHTS.MAINTENANCE +
      communityScore * WEIGHTS.COMMUNITY +
      documentationScore * WEIGHTS.DOCUMENTATION
  );

  const result: HealthScore = {
    overallScore,
    breakdown: {
      activityScore,
      maintenanceScore,
      communityScore,
      documentationScore,
    },
  };

  await cacheService.set(cacheKey, result, CACHE_TTL);
  return result;
}
