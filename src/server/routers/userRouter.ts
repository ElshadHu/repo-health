import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "@/trpc/init";
import { getUserRepos } from "../services/user/repoService";
import { prisma } from "@/lib/prisma";

type RepoSuggestion = {
  fullName: string;
  owner: string;
  name: string;
  private: boolean;
};

export const userRouter = router({
  getMyRepos: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.accessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message:
          "GitHub access token is missing or expired. Please sign in again.",
      });
    }
    return getUserRepos(ctx.session.accessToken);
  }),
  getRecentSearches: protectedProcedure.query(async ({ ctx }) => {
    return prisma.searchHistory.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { searchedAt: "desc" },
      take: 5,
    });
  }),
  saveSearch: protectedProcedure
    .input(z.object({ owner: z.string(), repo: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { owner, repo } = input;
      return prisma.searchHistory.upsert({
        where: {
          userId_owner_repo: {
            userId: ctx.session.user.id,
            owner,
            repo,
          },
        },
        update: { searchedAt: new Date() },
        create: {
          userId: ctx.session.user.id,
          owner,
          repo,
          fullName: `${owner}/${repo}`,
        },
      });
    }),

  searchRepos: publicProcedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ input }): Promise<RepoSuggestion[]> => {
      try {
        const response = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(input.query)}&per_page=5`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
              ...(process.env.GITHUB_TOKEN && {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              }),
            },
          }
        );

        if (!response.ok) return [];

        const data = await response.json();
        return (
          data.items?.map((repo: any) => ({
            fullName: repo.full_name,
            owner: repo.owner.login,
            name: repo.name,
            private: repo.private,
          })) || []
        );
      } catch {
        return [];
      }
    }),
});
