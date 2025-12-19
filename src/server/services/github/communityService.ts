import { cacheService } from "@/lib/redis";
import { CommunityHealth } from "../../types";
import { createOctokit, CACHE_TTL } from "./shared";

export async function getCommunityHealth(
  owner: string,
  repo: string,
  accessToken?: string | null
): Promise<CommunityHealth> {
  const octokit = createOctokit(accessToken);
  const cacheKey = `repo:community:${owner}:${repo}${accessToken ? ":auth" : ""}`;
  const cached = await cacheService.get<CommunityHealth>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await octokit.rest.repos.getCommunityProfileMetrics({
      owner,
      repo,
    });

    const result = {
      hasReadme: data.files.readme !== null,
      hasLicense: data.files.license !== null,
      hasContributing: data.files.contributing !== null,
      hasCodeOfConduct: data.files.code_of_conduct !== null,
      healthPercentage: data.health_percentage,
    };

    await cacheService.set(cacheKey, result, CACHE_TTL.COMMUNITY);
    return result;
  } catch (error) {
    // If endpoint fails, try manual checks
    return await checkCommunityFilesManually(owner, repo, accessToken);
  }
}

async function checkCommunityFilesManually(
  owner: string,
  repo: string,
  accessToken?: string | null
): Promise<CommunityHealth> {
  const octokit = createOctokit(accessToken);
  const filesToCheck = [
    "README.md",
    "LICENSE",
    "LICENSE.md",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
  ];

  const results = await Promise.allSettled(
    filesToCheck.map((file) =>
      octokit.rest.repos.getContent({
        owner,
        repo,
        path: file,
      })
    )
  );

  return {
    hasReadme: results[0].status === "fulfilled",
    hasLicense:
      results[1].status === "fulfilled" || results[2].status === "fulfilled",
    hasContributing: results[3].status === "fulfilled",
    hasCodeOfConduct: results[4].status === "fulfilled",
    healthPercentage: 0, // Not available in manual mode
  };
}
