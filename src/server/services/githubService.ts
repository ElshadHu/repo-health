import { Octokit } from "@octokit/rest";
import { cacheService } from "@/lib/redis";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Cache TTL: 1 hour for most data, 5 minutes for rate limit sensitive calls
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
  async getRepoInfo(owner: string, repo: string) {
    const cacheKey = `repo:info:${owner}:${repo}`;
    const cached = await cacheService.get<{
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
    }>(cacheKey);
    if (cached) return cached;

    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });

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
    };

    await cacheService.set(cacheKey, result, CACHE_TTL.REPO_INFO);
    return result;
  },

  /**
   * Get commits from the last 90 days
   */
  async getCommits(owner: string, repo: string) {
    const cacheKey = `repo:commits:${owner}:${repo}`;
    const cached = await cacheService.get(cacheKey);
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
  async getContributors(owner: string, repo: string) {
    const cacheKey = `repo:contributors:${owner}:${repo}`;
    const cached = await cacheService.get(cacheKey);
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
  async getLanguages(owner: string, repo: string) {
    const cacheKey = `repo:languages:${owner}:${repo}`;
    const cached = await cacheService.get(cacheKey);
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
  async getCommunityHealth(owner: string, repo: string) {
    const cacheKey = `repo:community:${owner}:${repo}`;
    const cached = await cacheService.get(cacheKey);
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
      return await this.checkCommunityFilesManually(owner, repo);
    }
  },

  /**
   * Fallback: manually check for community files
   */
  async checkCommunityFilesManually(owner: string, repo: string) {
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
  async getRateLimitStatus() {
    const { data } = await octokit.rest.rateLimit.get();
    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: new Date(data.rate.reset * 1000),
    };
  },
};
