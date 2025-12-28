import { z } from "zod";
import { router, publicProcedure } from "@/trpc/init";
import { createOctokit } from "@/server/services/github/shared";
import { getPitfalls } from "@/server/services/contributor";

export const contributorRouter = router({
  getPitfalls: publicProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const accessToken = ctx.session?.accessToken as string | undefined;
      const octokit = createOctokit(accessToken);
      const result = await getPitfalls(
        octokit,
        input.owner,
        input.repo,
        accessToken
      );
      return result;
    }),
});
