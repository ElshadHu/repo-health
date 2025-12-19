import { cacheService } from "@/lib/redis";
import { RateLimitStatus } from "../../types";
import { createOctokit, CACHE_TTL } from "./shared";

export async function getRateLimitStatus(
  accessToken?: string | null
): Promise<RateLimitStatus> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.rest.rateLimit.get();
  return {
    limit: data.rate.limit,
    remaining: data.rate.remaining,
    reset: new Date(data.rate.reset * 1000),
  };
}

export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  accessToken?: string | null
): Promise<string | null> {
  const octokit = createOctokit(accessToken);
  const cacheKey = `repo:file:${owner}:${repo}:${path}`;
  const cached = await cacheService.get<string>(cacheKey);
  if (cached) return cached;
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });
    if ("content" in data && typeof data.content === "string") {
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      await cacheService.set(cacheKey, content, CACHE_TTL.REPO_INFO);
      return content;
    }
    return null;
  } catch {
    return null;
  }
}
