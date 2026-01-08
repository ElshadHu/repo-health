// Uses REST API (not available in GraphQL)

import { createOctokit } from "../github/shared";

type WorkflowRun = {
  id: number;
  conclusion: string | null;
  status: string;
};

async function fetchWorkflowRuns(
  octokit: ReturnType<typeof createOctokit>,
  owner: string,
  repo: string
): Promise<WorkflowRun[]> {
  try {
    const { data } = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page: 100,
      status: "completed",
    });
    return data.workflow_runs as WorkflowRun[];
  } catch {
    return [];
  }
}

async function hasFailedJobs(
  octokit: ReturnType<typeof createOctokit>,
  owner: string,
  repo: string,
  runId: number
): Promise<boolean> {
  try {
    const { data: jobs } = await octokit.rest.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: runId,
    });
    return jobs.jobs.some((job) => job.conclusion === "failure");
  } catch {
    return false;
  }
}

export async function analyzeCIFailures(
  owner: string,
  repo: string,
  token?: string | null
): Promise<number> {
  const octokit = createOctokit(token);
  const runs = await fetchWorkflowRuns(octokit, owner, repo);

  if (runs.length === 0) return 0;

  const failedRuns = runs.filter((run) => run.conclusion === "failure");
  let analyzedCount = 0;

  for (const run of failedRuns.slice(0, 20)) {
    const hasFailed = await hasFailedJobs(octokit, owner, repo, run.id);
    if (hasFailed) analyzedCount++;
  }

  return analyzedCount;
}
