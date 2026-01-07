// Re-export all GitHub services under a single interface
// This maintains backward compatibility with existing imports

import { getRepoInfo, getLanguages } from "./repoService";
import { getCommits, getContributors } from "./activityService";
import { getCommunityHealth } from "./communityService";
import { getRateLimitStatus, getFileContent } from "./fileService";

export const githubService = {
  getRepoInfo,
  getLanguages,
  getCommits,
  getContributors,
  getCommunityHealth,
  getRateLimitStatus,
  getFileContent,
};
