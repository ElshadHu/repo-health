import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import { githubService } from "../services/githubService";
import { prisma } from "../../lib/prisma";

export const githubRouter = router({
  // firstly I need to get simple repo info
  getBasicInfo: publicProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
      })
    )
    .query(async ({ input }) => {
      const info = await githubService.getRepoInfo(input.owner, input.repo);
      await prisma.repository.upsert({
        where: {
          owner_name: {
            owner: input.owner,
            name: input.repo,
          },
        },
        create: {
          owner: input.owner,
          name: input.repo,
          url: info.url,
        },
        update: {
          url: info.url,
        },
      });
      return {
        name: info.name,
        owner: info.owner,
        description: info.description,
        stars: info.stars,
        forks: info.forks,
        language: info.language,
        url: info.url,
      };
    }),
});
