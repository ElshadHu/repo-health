import { cacheService } from "@/lib/redis";
import { Commit, Contributor } from "../../types";
import { createOctokit, CACHE_TTL, getTokenHash } from "./shared";

export async function getCommits(
  owner: string,
  repo: string,
  accessToken?: string | null
): Promise<Commit[]> {
  const octokit = createOctokit(accessToken);
  const tokenHash = getTokenHash(accessToken);
  const cacheKey = `repo:commits:${owner}:${repo}:${tokenHash}`;
  const cached = await cacheService.get<Commit[]>(cacheKey);
  if (cached) return cached;

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  try {
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
  } catch {
    // 409 = empty repository, 404 = not found/private
    return [];
  }
}

export async function getContributors(
  owner: string,
  repo: string,
  accessToken?: string | null
): Promise<Contributor[]> {
  const octokit = createOctokit(accessToken);
  const tokenHash = getTokenHash(accessToken);
  const cacheKey = `repo:contributors:${owner}:${repo}:${tokenHash}`;
  const cached = await cacheService.get<Contributor[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: 20,
    });

    // Handle empty repos where data might not be an array
    if (!Array.isArray(data)) {
      return [];
    }

    const result = data.map((contributor) => ({
      username: contributor.login,
      avatarUrl: contributor.avatar_url,
      contributions: contributor.contributions,
      url: contributor.html_url,
    }));

    await cacheService.set(cacheKey, result, CACHE_TTL.CONTRIBUTORS);
    return result;
  } catch {
    // 409 = empty repository, 404 = not found/private
    return [];
  }
}
