import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import { createOctokit } from "../services/github/shared";
import {
  fetchFileTree,
  filterImportantFiles,
  fetchKeyFiles,
  analyzeArchitecture,
} from "../services/overview";

export const overviewRouter = router({
  analyze: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string() }))
    .query(async ({ input, ctx }) => {
      const { owner, repo } = input;
      const octokit = createOctokit(ctx.session?.accessToken);

      // 1. Fetch file tree
      const allFiles = await fetchFileTree(octokit, owner, repo);
      const importantFiles = filterImportantFiles(allFiles);

      // 2. Fetch key files
      const keyFileContents = await fetchKeyFiles(octokit, owner, repo);

      // 3. AI analysis
      const analysis = await analyzeArchitecture(
        importantFiles,
        keyFileContents,
        owner,
        repo
      );

      return {
        analysis,
        fileTree: importantFiles,
        fileCount: allFiles.length,
        totalSize: allFiles.reduce((sum, f) => sum + (f.size || 0), 0),
      };
    }),
});
