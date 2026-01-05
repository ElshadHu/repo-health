// UNGH Client - Unlimited GitHub API for public repos
const UNGH_BASE = "https://ungh.cc";

export interface UnghRepo {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  stars: number;
  watchers: number;
  forks: number;
  defaultBranch: string;
}

export interface UnghContributor {
  id: number;
  username: string;
  contributions: number;
}
export interface UnghFile {
  path: string;
  mode: string;
  sha: string;
  size?: number;
}

// Fetch repo metadata
export async function fetchUnghRepo(
  owner: string,
  repo: string
): Promise<UnghRepo | null> {
  try {
    const res = await fetch(`${UNGH_BASE}/repos/${owner}/${repo}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.repo;
  } catch {
    return null;
  }
}

export async function fetchUnghContributors(
  owner: string,
  repo: string
): Promise<UnghContributor[]> {
  try {
    const res = await fetch(`${UNGH_BASE}/repos/${owner}/${repo}/contributors`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.contributors || [];
  } catch {
    return [];
  }
}

// Fetch file tree
export async function fetchUnghFiles(
  owner: string,
  repo: string,
  branch?: string
): Promise<UnghFile[]> {
  try {
    const branchPath = branch || "main";
    const res = await fetch(
      `${UNGH_BASE}/repos/${owner}/${repo}/files/${branchPath}`
    );
    if (!res.ok) {
      // Try "master" as fallback
      const masterRes = await fetch(
        `${UNGH_BASE}/repos/${owner}/${repo}/files/master`
      );
      if (!masterRes.ok) return [];
      const data = await masterRes.json();
      return data.files || [];
    }
    const data = await res.json();
    return data.files || [];
  } catch {
    return [];
  }
}
