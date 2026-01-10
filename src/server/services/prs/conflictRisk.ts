// Calculate merge conflict risk for open community PRs
// This module analyzes PRs that may have developed conflicts due to other PRs being merged first

import type {
  GitHubPR,
  MergeConflictFairness,
  ConflictRiskPR,
} from "../../types";

const MAINTAINER_ROLES = ["OWNER", "MEMBER", "COLLABORATOR"];

// Calculate merge conflict risk for open community PRs
// Risk = (days waiting) × (PRs merged after this one) / 10
export function calculateConflictRisk(
  openPRs: GitHubPR[],
  mergedPRs: GitHubPR[]
): MergeConflictFairness {
  const now = Date.now();
  const riskPRs: ConflictRiskPR[] = [];

  // Only analyze community PRs (not maintainers or bots)
  const communityOpenPRs = openPRs.filter(
    (pr) =>
      !MAINTAINER_ROLES.includes(pr.author_association) &&
      pr.user?.type !== "Bot"
  );

  for (const pr of communityOpenPRs) {
    const createdAt = new Date(pr.created_at).getTime();
    const daysSinceCreated = Math.floor(
      (now - createdAt) / (1000 * 60 * 60 * 24)
    );

    // Count PRs merged after this one was created
    const prsMergedAfter = mergedPRs.filter((merged) => {
      const mergedAt = new Date(merged.merged_at!).getTime();
      return mergedAt > createdAt;
    }).length;

    // Only include if there's actual risk (waiting > 3 days AND PRs merged after)
    if (daysSinceCreated >= 3 && prsMergedAfter > 0) {
      const riskScore = Math.round((daysSinceCreated * prsMergedAfter) / 10);
      riskPRs.push({
        number: pr.number,
        title: pr.title,
        url: pr.html_url,
        author: pr.user?.login || "unknown",
        daysSinceCreated,
        prsMergedAfter,
        riskScore,
      });
    }
  }

  // Sort by risk score and take top 5
  riskPRs.sort((a, b) => b.riskScore - a.riskScore);
  const atRiskPRs = riskPRs.slice(0, 5);

  // Calculate average wait days for at-risk PRs
  const avgWaitDays =
    atRiskPRs.length > 0
      ? Math.round(
          atRiskPRs.reduce((sum, pr) => sum + pr.daysSinceCreated, 0) /
            atRiskPRs.length
        )
      : 0;

  return { atRiskPRs, avgWaitDays };
}
