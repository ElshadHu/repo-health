import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import { githubService } from "../services/github";
import { prisma } from "../../lib/prisma";

const repoInput = z.object({
  owner: z.string(),
  repo: z.string(),
});

export const repoRouter = router({
  getBasicInfo: publicProcedure
    .input(repoInput)
    .query(async ({ input, ctx }) => {
      const accessToken = ctx.session?.accessToken;

      try {
        const info = await githubService.getRepoInfo(
          input.owner,
          input.repo,
          accessToken
        );

        await prisma.repository.upsert({
          where: { owner_name: { owner: input.owner, name: input.repo } },
          create: {
            owner: input.owner,
            name: input.repo,
            url: info.url,
            isPrivate: info.isPrivate || false,
          },
          update: {
            url: info.url,
            isPrivate: info.isPrivate || false,
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
          isPrivate: info.isPrivate,
        };
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

  getCompleteAnalysis: publicProcedure
    .input(repoInput)
    .query(async ({ input, ctx }) => {
      const accessToken = ctx.session?.accessToken;

      try {
        const repoInfo = await githubService.getRepoInfo(
          input.owner,
          input.repo,
          accessToken
        );

        const [commits, contributors, languages, communityHealth] =
          await Promise.all([
            githubService.getCommits(input.owner, input.repo, accessToken),
            githubService.getContributors(input.owner, input.repo, accessToken),
            githubService.getLanguages(input.owner, input.repo, accessToken),
            githubService.getCommunityHealth(
              input.owner,
              input.repo,
              accessToken
            ),
          ]);

        await prisma.repository.upsert({
          where: { owner_name: { owner: input.owner, name: input.repo } },
          create: {
            owner: input.owner,
            name: input.repo,
            url: repoInfo.url,
            isPrivate: repoInfo.isPrivate || false,
          },
          update: {
            url: repoInfo.url,
            updatedAt: new Date(),
            isPrivate: repoInfo.isPrivate || false,
          },
        });

        return {
          repository: repoInfo,
          activity: { commits, commitCount: commits.length },
          contributors,
          languages,
          communityHealth,
        };
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
