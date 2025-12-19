import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import { dependencyService } from "../services/dependencyService";

const repoInput = z.object({
  owner: z.string(),
  repo: z.string(),
});

export const dependencyRouter = router({
  analyze: publicProcedure.input(repoInput).query(async ({ input, ctx }) => {
    const accessToken = ctx.session?.accessToken;
    return await dependencyService.analyze(
      input.owner,
      input.repo,
      accessToken
    );
  }),
});
