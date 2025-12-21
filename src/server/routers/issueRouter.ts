import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import * as issueService from "../services/issues/analyze";
import { searchQuestions } from "../services/external/stackOverflowService";
import { searchByTag } from "../services/external/devToService";

export const issueRouter = router({
  analyze: publicProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const result = await issueService.analyze({
        owner: input.owner,
        repo: input.repo,
        token: ctx.session?.accessToken,
      });
      return result;
    }),

  findResources: publicProcedure
    .input(
      z.object({
        title: z.string(),
        labels: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      // Extract search terms from title and labels
      const query = input.title.slice(0, 80);
      const tags = input.labels.slice(0, 3);

      // Fetch in parallel
      const [questions, articles] = await Promise.all([
        searchQuestions(query, tags, 5),
        searchByTag(tags[0] || "programming", 5),
      ]);

      const result = {
        questions,
        articles,
      };

      return result;
    }),
});
