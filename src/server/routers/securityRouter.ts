import { z } from "zod";
import { router, publicProcedure } from "@/trpc/init";
import { createOctokit } from "../services/github/shared";
import {
  scanContent,
  createScanResult,
  type Finding,
} from "../services/security";
const MAX_FILES = 30;
const MAX_FILE_SIZE = 100000; // 100 KB

const PRIORITY_EXTENSIONS = [
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".py",
  ".json",
  ".yaml",
  ".yml",
  ".env",
];

function isPriorityFile(path: string): boolean {
  const lower = path.toLowerCase();
  return (
    PRIORITY_EXTENSIONS.some((ext) => lower.endsWith(ext)) ||
    lower.includes("config") ||
    lower.includes("secret") ||
    lower.includes("credential")
  );
}

function shouldSkip(path: string): boolean {
  return (
    path.includes("node_modules/") ||
    path.includes("vendor/") ||
    path.includes(".min.js") ||
    path.includes("package-lock.json") ||
    path.includes("yarn.lock")
  );
}

export const securityRouter = router({
  scan: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string() }))
    .query(async ({ input, ctx }) => {
      const { owner, repo } = input;
      const octokit = createOctokit(ctx.session?.accessToken);
      // Step 1: Get default branch
      const { data: repoData } = await octokit.repos.get({ owner, repo });
      const branch = repoData.default_branch;
      // Step 2: Get file tree
      const { data: tree } = await octokit.git.getTree({
        owner,
        repo,
        tree_sha: branch,
        recursive: "1",
      });
      // Step 3: Filter to priority files
      const files = tree.tree
        .filter(
          (item) => item.type === "blob" && item.path && !shouldSkip(item.path)
        )
        .filter((item) => isPriorityFile(item.path!))
        .slice(0, MAX_FILES);
      // Step 4: Fetch content and scan each file
      const allFindings: Finding[] = [];
      for (const file of files) {
        try {
          const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: file.path!,
          });
          if ("content" in data && data.size < MAX_FILE_SIZE) {
            const content = Buffer.from(data.content, "base64").toString(
              "utf-8"
            );
            const findings = scanContent(content, file.path!);
            allFindings.push(...findings);
          }
        } catch {
          // Skip files that can't be fetched
        }
      }
      // Step 5: Create result
      return createScanResult(allFindings, files.length);
    }),
});
