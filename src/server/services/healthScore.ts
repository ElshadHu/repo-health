import { githubService } from "./githubService";
import { HealthScore } from "../types";
import {
  calculateActivityScore,
  calculateMaintenanceScore,
  calculateCommunityScore,
  calculateDocumentationScore,
  WEIGHTS,
} from "./calculations";

export const calculateHealthScore = {
  async calculateScore(
    owner: string,
    repo: string,
    accessToken?: string | null
  ): Promise<HealthScore> {
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

    return result;
  },
};
