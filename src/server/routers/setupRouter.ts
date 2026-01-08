import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import { setupService } from "../services/setup/analyze";

const repoInput = z.object({
  owner: z.string(),
  repo: z.string(),
});

export const setupRouter = router({
  getInsights: publicProcedure
    .input(repoInput)
    .query(async ({ input, ctx }) => {
      const accessToken = ctx.session?.accessToken;
      return await setupService.analyzeSetup(
        input.owner,
        input.repo,
        accessToken
      );
    }),
});
