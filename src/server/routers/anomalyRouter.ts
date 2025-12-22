import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import { createOctokit } from "../services/github/shared";
import { analyzeActivity } from "../services/anomaly";
import type { CommitWithStats } from "../types";

export const anomalyRouter = router({
  analyze: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string() }))
    .query(async ({ input, ctx }) => {
      const { owner, repo } = input;
      const octokit = createOctokit(ctx.session?.accessToken);

      // Fetch commits from last 90 days
      const since = new Date();
      since.setDate(since.getDate() - 90);

      const { data: commits } = await octokit.repos.listCommits({
        owner,
        repo,
        since: since.toISOString(),
        per_page: 100,
      });

      // Get stats for each commit (limit to 50 for performance)
      const commitData: CommitWithStats[] = await Promise.all(
        commits.slice(0, 50).map(async (c) => {
          let additions = 0,
            deletions = 0,
            files: string[] = [];

          try {
            const { data: detail } = await octokit.repos.getCommit({
              owner,
              repo,
              ref: c.sha,
            });
            additions = detail.stats?.additions || 0;
            deletions = detail.stats?.deletions || 0;
            files = detail.files?.map((f) => f.filename) || [];
          } catch {
            /* Skip if can't fetch */
          }

          return {
            sha: c.sha,
            message: c.commit.message,
            author: c.author?.login || c.commit.author?.name || "unknown",
            date: c.commit.author?.date || new Date().toISOString(),
            url: c.html_url,
            additions,
            deletions,
            files,
          };
        })
      );

      return analyzeActivity(commitData, owner, repo);
    }),
});
