import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import { calculateHealthScore } from "../services/healthScore";

const repoInput = z.object({
  owner: z.string(),
  repo: z.string(),
});

export const healthRouter = router({
  getScore: publicProcedure.input(repoInput).query(async ({ input, ctx }) => {
    const accessToken = ctx.session?.accessToken;

    try {
      return await calculateHealthScore(input.owner, input.repo, accessToken);
    } catch (error: any) {
      if (
        error.message === "REPO_NOT_FOUND_OR_PRIVATE" ||
        error.message === "PRIVATE_REPO_REQUIRES_AUTH"
      ) {
        throw new Error(
          "Repository is either private or does not exist. Please sign in to access private repositories."
        );
      }
      throw error;
    }
  }),
});
