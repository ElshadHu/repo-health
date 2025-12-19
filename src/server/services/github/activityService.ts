import { cacheService } from "@/lib/redis";
import { Commit, Contributor } from "../../types";
import { createOctokit, CACHE_TTL } from "./shared";

export async function getCommits(
  owner: string,
  repo: string,
  accessToken?: string | null
): Promise<Commit[]> {
  const octokit = createOctokit(accessToken);
  const cacheKey = `repo:commits:${owner}:${repo}${accessToken ? ":auth" : ""}`;
  const cached = await cacheService.get<Commit[]>(cacheKey);
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
}

export async function getContributors(
  owner: string,
  repo: string,
  accessToken?: string | null
): Promise<Contributor[]> {
  const octokit = createOctokit(accessToken);
  const cacheKey = `repo:contributors:${owner}:${repo}${accessToken ? ":auth" : ""}`;
  const cached = await cacheService.get<Contributor[]>(cacheKey);
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
}
