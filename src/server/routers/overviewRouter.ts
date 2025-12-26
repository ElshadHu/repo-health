import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import { createOctokit } from "../services/github/shared";
import {
  fetchFileTree,
  filterImportantFiles,
  fetchKeyFiles,
  analyzeArchitecture,
  mapIssuesToFiles,
} from "../services/overview";
import * as issueservice from "../services/issues/analyze";
import { calculateHealthScore } from "../services/healthScore";
import { githubService } from "../services/github";

export const overviewRouter = router({
  analyze: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string() }))
    .query(async ({ input, ctx }) => {
      const { owner, repo } = input;
      const accessToken = ctx.session?.accessToken;
      const octokit = createOctokit(accessToken);
      const [healthScore, repoInfo] = await Promise.all([
        calculateHealthScore(owner, repo, accessToken),
        githubService.getRepoInfo(owner, repo, accessToken),
      ]);
      // 1. Fetch file tree
      const allFiles = await fetchFileTree(octokit, owner, repo);
      const importantFiles = filterImportantFiles(allFiles);

      // 2. Fetch key files
      const keyFileContents = await fetchKeyFiles(octokit, owner, repo);

      // 3. AI analysis (pass isAuthenticated to isolate cache for private repos)
      const analysis = await analyzeArchitecture(
        importantFiles,
        keyFileContents,
        owner,
        repo,
        healthScore,
        repoInfo,
        !!accessToken // isAuthenticated flag for cache isolation
      );
      const issueStats = await issueservice.analyze({
        owner,
        repo,
        token: accessToken,
      });
      const fileIssueMap = await mapIssuesToFiles({
        issues: issueStats.issues,
        fileTree: importantFiles,
        repoInfo: { owner, repo },
        isAuthenticated: !!accessToken, // for cache isolation
      });
      // Calculate score with AI adjustment
      const aiAdjustment = analysis.scoreInsights?.adjustment?.amount || 0;
      const finalScore = Math.max(
        0,
        Math.min(100, healthScore.overallScore + aiAdjustment)
      );
      return {
        analysis,
        fileTree: importantFiles,
        fileCount: allFiles.length,
        totalSize: allFiles.reduce((sum, f) => sum + (f.size || 0), 0),
        fileIssueMap,
        defaultBranch: repoInfo.defaultBranch || "main",
        healthScore: {
          ...healthScore,
          aiAdjustment,
          finalScore,
        },
      };
    }),
});
