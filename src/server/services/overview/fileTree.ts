import { Octokit } from "@octokit/rest";
import type { FileNode } from "@/server/types";

export async function fetchFileTree(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<FileNode[]> {
  const { data } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: "HEAD",
    recursive: "true",
  });

  return data.tree
    .filter((item) => item.path && item.type)
    .map((item) => ({
      path: item.path!,
      type: item.type as "blob" | "tree",
      size: item.size,
    }));
}

export function filterImportantFiles(files: FileNode[]): FileNode[] {
  const PRIORITY_PATTERNS = [
    /^src\//,
    /^app\//,
    /^packages\//,
    /^lib\//,
    /\.tsx?$/,
    /\.jsx?$/,
  ];
  const EXCLUDE_PATTERNS = [
    /node_modules/,
    /\.git/,
    /dist\//,
    /build\//,
    /\.lock$/,
  ];
  return files
    .filter((f) => f.type === "blob")
    .filter((f) => !EXCLUDE_PATTERNS.some((p) => p.test(f.path)))
    .sort((a, b) => {
      const aScore = PRIORITY_PATTERNS.filter((p) => p.test(a.path)).length;
      const bScore = PRIORITY_PATTERNS.filter((p) => p.test(b.path)).length;
      return bScore - aScore;
    })
    .slice(0, 200);
}
