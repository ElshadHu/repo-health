import { Octokit } from "@octokit/rest";
import crypto from "crypto";

export const createOctokit = (accessToken?: string | null) => {
  return new Octokit({
    auth: accessToken || process.env.GITHUB_TOKEN,
  });
};

// Generate a short hash of the token for cache key differentiation
export function getTokenHash(token?: string | null): string {
  if (!token) return "public";
  return crypto.createHash("sha256").update(token).digest("hex").slice(0, 8);
}

export const CACHE_TTL = {
  REPO_INFO: 3600, // 1 hour
  COMMITS: 1800, // 30 minutes
  CONTRIBUTORS: 3600, // 1 hour
  LANGUAGES: 7200, // 2 hours
  COMMUNITY: 7200, // 2 hours
};
