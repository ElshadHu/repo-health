import { Octokit } from "@octokit/rest";
import { cacheService } from "@/lib/redis";

// Create Octokit instance with optional access token
const createOctokit = (accessToken?: string | null) => {
  return new Octokit({
    auth: accessToken || process.env.GITHUB_TOKEN,
  });
};

const CACHE_TTL = {
  REPO_INFO: 3600, // 1 hour
  COMMITS: 1800, // 30 minutes
  CONTRIBUTORS: 3600, // 1 hour
  LANGUAGES: 7200, // 2 hours
  COMMUNITY: 7200, // 2 hours
};

export const githubService = {
  /**
   * Get repository basic information
   */
  async getRepoInfo(owner: string, repo: string, accessToken?: string | null) {
    const cacheKey = `repo:info:${owner}:${repo}${accessToken ? ":auth" : ""}`;
    const cached = await cacheService.get<
      | {
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
        }
      | { error: string }
    >(cacheKey);

    // Check for cached errors (404/private)
    if (cached && "error" in cached) {
      throw new Error(cached.error);
    }

    // Check cached data for private repos without auth
    if (cached) {
      if (cached.isPrivate && !accessToken) {
        throw new Error("PRIVATE_REPO_REQUIRES_AUTH");
      }
      return cached;
    }

    const octokit = createOctokit(accessToken);

    try {
      const { data } = await octokit.rest.repos.get({
        owner,
        repo,
      });

      // Check if repo is private BEFORE processing data
      // If repo is private but user is not authenticated, throw an error
      if (data.private && !accessToken) {
        throw new Error("PRIVATE_REPO_REQUIRES_AUTH");
      }

      const result = {
        name: data.name,
        owner: data.owner.login,
        description: data.description,
        url: data.html_url,
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        openIssues: data.open_issues_count,
        defaultBranch: data.default_branch,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isPrivate: data.private,
      };

      await cacheService.set(cacheKey, result, CACHE_TTL.REPO_INFO);
      return result;
    } catch (error: any) {
      if (error.status === 404) {
        // Cache 404 errors for 5 minutes to avoid repeated API calls
        await cacheService.set(
          cacheKey,
          { error: "REPO_NOT_FOUND_OR_PRIVATE" },
          300
        );
        throw new Error("REPO_NOT_FOUND_OR_PRIVATE");
      }
      if (error.message === "PRIVATE_REPO_REQUIRES_AUTH") {
        // Cache private repo errors for 5 minutes
        await cacheService.set(
          cacheKey,
          { error: "PRIVATE_REPO_REQUIRES_AUTH" },
          300
        );
        throw error;
      }
      // Re-throw other errors
      throw error;
    }
  },

  /**
   * Get commits from the last 90 days
   */
  async getCommits(owner: string, repo: string, accessToken?: string | null) {
    const octokit = createOctokit(accessToken);
    const cacheKey = `repo:commits:${owner}:${repo}${accessToken ? ":auth" : ""}`;
    const cached = await cacheService.get<
      {
        sha: string;
        message: string;
        author: string;
        date: string;
        url: string;
      }[]
    >(cacheKey);
    if (cached) return cached;

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      since: ninetyDaysAgo.toISOString(),
      per_page: 100,
      page: 1,
    });

    const result = data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author?.name ?? "Unknown",
      date: commit.commit.author?.date ?? new Date().toISOString(),
      url: commit.html_url,
    }));

    await cacheService.set(cacheKey, result, CACHE_TTL.COMMITS);
    return result;
  },

  /**
   * Get top contributors
   */
  async getContributors(
    owner: string,
    repo: string,
    accessToken?: string | null
  ) {
    const octokit = createOctokit(accessToken);
    const cacheKey = `repo:contributors:${owner}:${repo}${accessToken ? ":auth" : ""}`;
    const cached = await cacheService.get<
      {
        username: string | undefined;
        avatarUrl: string;
        contributions: number;
        url: string | undefined;
      }[]
    >(cacheKey);
    if (cached) return cached;

    const { data } = await octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: 20,
    });

    const result = data.map((contributor) => ({
      username: contributor.login,
      avatarUrl: contributor.avatar_url,
      contributions: contributor.contributions,
      url: contributor.html_url,
    }));

    await cacheService.set(cacheKey, result, CACHE_TTL.CONTRIBUTORS);
    return result;
  },

  /**
   * Get language breakdown
   */
  async getLanguages(owner: string, repo: string, accessToken?: string | null) {
    const octokit = createOctokit(accessToken);
    const cacheKey = `repo:languages:${owner}:${repo}${accessToken ? ":auth" : ""}`;
    const cached = await cacheService.get<Record<string, number>>(cacheKey);
    if (cached) return cached;

    const { data } = await octokit.rest.repos.listLanguages({
      owner,
      repo,
    });

    await cacheService.set(cacheKey, data, CACHE_TTL.LANGUAGES);
    return data;
  },

  /**
   * Check for community health files (README, LICENSE, etc.)
   */
  async getCommunityHealth(
    owner: string,
    repo: string,
    accessToken?: string | null
  ) {
    const octokit = createOctokit(accessToken);
    const cacheKey = `repo:community:${owner}:${repo}${accessToken ? ":auth" : ""}`;
    const cached = await cacheService.get<{
      hasReadme: boolean;
      hasLicense: boolean;
      hasContributing: boolean;
      hasCodeOfConduct: boolean;
      healthPercentage: number;
    }>(cacheKey);
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
      return await this.checkCommunityFilesManually(owner, repo, accessToken);
    }
  },

  /**
   * Fallback: manually check for community files
   */
  async checkCommunityFilesManually(
    owner: string,
    repo: string,
    accessToken?: string | null
  ) {
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
  },

  /**
   * Get GitHub API rate limit status
   */
  async getRateLimitStatus(accessToken?: string | null) {
    const octokit = createOctokit(accessToken);
    const { data } = await octokit.rest.rateLimit.get();
    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: new Date(data.rate.reset * 1000),
    };
  },
};
