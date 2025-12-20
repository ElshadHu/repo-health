import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import { prService } from "../services/prs/analyze";

const repoInput = z.object({
  owner: z.string(),
  repo: z.string(),
});

export const prRouter = router({
  getStats: publicProcedure.input(repoInput).query(async ({ input, ctx }) => {
    const accessToken = ctx.session?.accessToken;
    return await prService.analyze({
      owner: input.owner,
      repo: input.repo,
      token: accessToken,
    });
  }),
});
