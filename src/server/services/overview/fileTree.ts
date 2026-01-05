import { Octokit } from "@octokit/rest";
import type { FileNode } from "@/server/types";
import { fetchUnghFiles } from "@/lib/ungh";

export async function fetchFileTree(
  octokit: Octokit | null,
  owner: string,
  repo: string,
  defaultBranch?: string
): Promise<FileNode[]> {
  if (!octokit) {
    const unghFiles = await fetchUnghFiles(owner, repo, defaultBranch);
    if (unghFiles.length > 0) {
      return unghFiles.map((f) => ({
        path: f.path,
        type: f.size !== undefined ? "blob" : "tree",
        size: f.size,
      }));
    }
  }
  // Fallback to GitHub API
  if (!octokit) return [];
  try {
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
  } catch {
    // 409 = empty repository (no commits), 404 = not found
    return [];
  }
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
