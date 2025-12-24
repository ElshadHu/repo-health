import { createOctokit } from "../github/shared";
import type { IssueInfo, IssueStats } from "../../types";
import { calculateAllCrackability } from "./crackabilityScore";
import { findHiddenGems } from "./hiddenGems";
import { findHotIssues } from "./hotIssues";
import { buildPathways } from "./pathways";

type AnalyzeParams = {
  owner: string;
  repo: string;
  token?: string | null;
};

async function fetchIssues(
  owner: string,
  repo: string,
  token?: string | null
): Promise<IssueInfo[]> {
  const octokit = createOctokit(token);

  // Fetch last 100 issues (both open and closed)
  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: "all",
    per_page: 100,
    sort: "updated",
    direction: "desc",
  });

  // Filter out PRs and map to our type
  return data
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      body: issue.body ?? null,
      state: issue.state as "open" | "closed",
      url: issue.html_url,
      author: issue.user?.login || "unknown",
      authorAvatar: issue.user?.avatar_url || null,
      labels: issue.labels
        .map((l) => (typeof l === "string" ? l : l.name || ""))
        .filter(Boolean),
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      closedAt: issue.closed_at,
      commentsCount: issue.comments,
      reactions: issue.reactions?.total_count || 0,
      assignees: issue.assignees?.map((a) => a.login) || [],
      milestone: issue.milestone?.title || null,
      isPullRequest: false,
    }));
}

function calculateCloseTimeStats(issues: IssueInfo[]): {
  avgCloseTimeHours: number;
  medianCloseTimeHours: number;
} {
  const closedIssues = issues.filter((i) => i.closedAt);

  if (closedIssues.length === 0) {
    return { avgCloseTimeHours: 0, medianCloseTimeHours: 0 };
  }

  const closeTimes = closedIssues.map((issue) => {
    const created = new Date(issue.createdAt).getTime();
    const closed = new Date(issue.closedAt!).getTime();
    return (closed - created) / (1000 * 60 * 60); // hours
  });

  const avg = closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length;
  const sorted = [...closeTimes].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  return {
    avgCloseTimeHours: Math.round(avg),
    medianCloseTimeHours: Math.round(median),
  };
}

function countGoodFirstIssues(issues: IssueInfo[]): number {
  const goodFirstLabels = ["good first issue", "good-first-issue", "beginner"];
  return issues.filter(
    (i) =>
      i.state === "open" &&
      i.labels.some((l) => goodFirstLabels.includes(l.toLowerCase()))
  ).length;
}

function countHelpWantedIssues(issues: IssueInfo[]): number {
  const helpLabels = ["help wanted", "help-wanted", "contributions welcome"];
  return issues.filter(
    (i) =>
      i.state === "open" &&
      i.labels.some((l) => helpLabels.includes(l.toLowerCase()))
  ).length;
}

export async function analyze(params: AnalyzeParams): Promise<IssueStats> {
  const { owner, repo, token } = params;

  // Fetch issues from GitHub
  const issues = await fetchIssues(owner, repo, token);

  const open = issues.filter((i) => i.state === "open").length;
  const closed = issues.filter((i) => i.state === "closed").length;

  // Calculate all stats
  const crackabilityScores = calculateAllCrackability(issues);
  const hiddenGems = findHiddenGems(issues);
  const hotIssues = findHotIssues(issues);
  const pathways = buildPathways(issues, crackabilityScores);
  const { avgCloseTimeHours, medianCloseTimeHours } =
    calculateCloseTimeStats(issues);
  const goodFirstIssues = countGoodFirstIssues(issues);
  const helpWantedIssues = countHelpWantedIssues(issues);

  const result: IssueStats = {
    total: issues.length,
    open,
    closed,
    avgCloseTimeHours,
    medianCloseTimeHours,
    issues,
    crackabilityScores,
    pathways,
    hiddenGems,
    hotIssues,
    goodFirstIssues,
    helpWantedIssues,
  };

  return result;
}
