import { z } from "zod";
import { router, publicProcedure } from "@/trpc/init";
import { fundingService } from "../services/funding/funding";

const repoInput = z.object({
  owner: z.string(),
  repo: z.string(),
});

export const fundingRouter = router({
  getFunding: publicProcedure.input(repoInput).query(async ({ input, ctx }) => {
    const accessToken = ctx.session?.accessToken;
    return await fundingService.analyzeFunding({
      owner: input.owner,
      repo: input.repo,
      token: accessToken,
    });
  }),
});
