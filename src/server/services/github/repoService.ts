import { cacheService } from "@/lib/redis";
import { RepoInfo } from "../../types";
import { createOctokit, CACHE_TTL, getTokenHash } from "./shared";
import { fetchUnghRepo } from "@/lib/ungh";

export async function getRepoInfo(
  owner: string,
  repo: string,
  accessToken?: string | null
): Promise<RepoInfo> {
  // Use token hash to ensure private repo cache is user-specific
  const tokenHash = getTokenHash(accessToken);
  const cacheKey = `repo:info:${owner}:${repo}:${tokenHash}`;
  const cached = await cacheService.get<RepoInfo | { error: string }>(cacheKey);

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
  // Try UNGH first for unauthenticated users - public repo

  if (!accessToken) {
    const unghData = await fetchUnghRepo(owner, repo);
    if (unghData) {
      const result: RepoInfo = {
        name: unghData.name,
        owner: owner,
        description: unghData.description,
        url: `https://github.com/${owner}/${repo}`,
        stars: unghData.stars,
        forks: unghData.forks,
        language: null, // UNGH doesn't provide language
        openIssues: 0, // UNGH doesn't provide this
        defaultBranch: unghData.defaultBranch,
        createdAt: unghData.createdAt,
        updatedAt: unghData.updatedAt,
        isPrivate: false, // UNGH only returns public repos
      };
      await cacheService.set(cacheKey, result, CACHE_TTL.REPO_INFO);
      return result;
    }
  }
  // here we go, in fallback condition GitHub API (for auth users or if UNGH fails)
  const octokit = createOctokit(accessToken);

  try {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });
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
  } catch (error) {
    const err = error as Error & {
      status?: number;
    };
    if (err.status === 404) {
      // Cache 404 errors for 5 minutes to avoid repeated API calls
      await cacheService.set(
        cacheKey,
        { error: "REPO_NOT_FOUND_OR_PRIVATE" },
        300
      );
      throw new Error("REPO_NOT_FOUND_OR_PRIVATE");
    }
    if (err.message === "PRIVATE_REPO_REQUIRES_AUTH") {
      // Cache private repo errors for 5 minutes
      await cacheService.set(
        cacheKey,
        { error: "PRIVATE_REPO_REQUIRES_AUTH" },
        300
      );
      throw err;
    }
    // Re-throw other errors
    throw err;
  }
}

export async function getLanguages(
  owner: string,
  repo: string,
  accessToken?: string | null
) {
  const octokit = createOctokit(accessToken);
  const tokenHash = getTokenHash(accessToken);
  const cacheKey = `repo:languages:${owner}:${repo}:${tokenHash}`;
  const cached = await cacheService.get<Record<string, number>>(cacheKey);
  if (cached) return cached;

  const { data } = await octokit.rest.repos.listLanguages({
    owner,
    repo,
  });

  await cacheService.set(cacheKey, data, CACHE_TTL.LANGUAGES);
  return data;
}
