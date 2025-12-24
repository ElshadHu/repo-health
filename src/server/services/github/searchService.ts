import { cacheService } from "@/lib/redis";
import type { RelatedPRs, IssueCheckResult } from "../../types";

const CACHE_TTL = {
  RELATED_PRS: 12 * 60 * 60,
  ISSUE_CHECK: 60 * 60,
};

// Search GitHub for PRs that fixed this vulnerability
export async function searchRelatedPRs(vulnId: string): Promise<RelatedPRs[]> {
  const cacheKey = `related-prs:${vulnId}`;
  const cached = await cacheService.get<RelatedPRs[]>(cacheKey);
  if (cached) return cached;

  try {
    const query = encodeURIComponent(`${vulnId} is:pr is:merged`);
    const response = await fetch(
      `https://api.github.com/search/issues?q=${query}&per_page=10`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const prs: RelatedPRs[] = data.items.map(
      (item: {
        repository_url: string;
        number: number;
        title: string;
        html_url: string;
        pull_request: {
          merged_at?: string;
        };
        state: string;
      }) => ({
        repo: item.repository_url.replace("https://api.github.com/repos/", ""),
        prNumber: item.number,
        title: item.title,
        url: item.html_url,
        status: item.pull_request?.merged_at ? "merged" : item.state,
        mergedAt: item.pull_request?.merged_at || "",
      })
    );

    await cacheService.set(cacheKey, prs, CACHE_TTL.RELATED_PRS);
    return prs;
  } catch {
    return [];
  }
}

// Check if an issue already exists for this vulnerability
export async function checkIssueExists(
  owner: string,
  repo: string,
  vulnId: string
): Promise<IssueCheckResult> {
  const cacheKey = `issue-check:${owner}:${repo}:${vulnId}`;
  const cached = await cacheService.get<IssueCheckResult>(cacheKey);
  if (cached) return cached;

  try {
    const query = encodeURIComponent(
      `repo:${owner}/${repo} ${vulnId} is:issue`
    );
    const response = await fetch(
      `https://api.github.com/search/issues?q=${query}&per_page=1`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return { exists: false };
    }

    const data = await response.json();
    if (data.items.length > 0) {
      const issue = data.items[0];
      const result: IssueCheckResult = {
        exists: true,
        url: issue.html_url,
        title: issue.title,
        state: issue.state,
      };
      await cacheService.set(cacheKey, result, CACHE_TTL.ISSUE_CHECK);
      return result;
    }

    const notFound: IssueCheckResult = { exists: false };
    await cacheService.set(cacheKey, notFound, CACHE_TTL.ISSUE_CHECK);
    return notFound;
  } catch {
    return { exists: false };
  }
}
