import { Octokit } from "@octokit/rest";

export const createOctokit = (accessToken?: string | null) => {
  return new Octokit({
    auth: accessToken || process.env.GITHUB_TOKEN,
  });
};

export const CACHE_TTL = {
  REPO_INFO: 3600, // 1 hour
  COMMITS: 1800, // 30 minutes
  CONTRIBUTORS: 3600, // 1 hour
  LANGUAGES: 7200, // 2 hours
  COMMUNITY: 7200, // 2 hours
};
