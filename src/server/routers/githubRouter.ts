import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import { githubService } from "../services/githubService";

export const githubRouter = router({
  analyze: publicProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
      })
    )
    .query(async ({ input }) => {
      const [info, commits, contributors, languages] = await Promise.all([
        githubService.getRepoInfo(input.owner, input.repo),
        githubService.getCommits(input.owner, input.repo),
        githubService.getContributors(input.owner, input.repo),
        githubService.getLanguages(input.owner, input.repo),
      ]);

      return {
        info,
        commits,
        contributors,
        languages,
      };
    }),
});
