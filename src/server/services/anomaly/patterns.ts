import { CommitWithStats } from "../../types";

export type AnomalyLinks = {
  commit?: string;
  diff?: string;
  author?: string;
};
export type PatternAnomaly = {
  type: "churn" | "velocity" | "time" | "file" | "pattern";
  severity: "critical" | "warning" | "info";
  description: string;
  zScore?: string;
  commit?: CommitWithStats;
  timestamp: string;
  links?: AnomalyLinks;
};

function mean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  const avg = mean(values);
  const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

export function zScore(value: number, values: number[]): number {
  const std = standardDeviation(values);
  if (std === 0) {
    return 0;
  }
  return (value - mean(values)) / std;
}

export function buildLinks(
  owner: string,
  repo: string,
  commit?: CommitWithStats
): AnomalyLinks {
  if (!commit) return {};
  return {
    commit: `https://github.com/${owner}/${repo}/commit/${commit.sha}`,
    diff: `https://github.com/${owner}/${repo}/commit/${commit.sha}.diff`,
    author: `https://github.com/${commit.author}`,
  };
}

const SENSITIVE_PATTERNS = [
  /\.env/i,
  /\.pem$/i,
  /\.key$/i,
  /secrets?\./i,
  /credentials?\./i,
  /password/i,
  /id_rsa/i,
];

export function detectChurnAnomalies(
  commits: CommitWithStats[],
  owner: string,
  repo: string
): PatternAnomaly[] {
  const anomalies: PatternAnomaly[] = [];

  for (const commit of commits) {
    const total = commit.additions + commit.deletions;
    if (total === 0) continue;

    const churnRatio = commit.deletions / total;

    if (churnRatio > 0.8 && commit.deletions > 100) {
      anomalies.push({
        type: "churn",
        severity: churnRatio > 0.9 ? "critical" : "warning",
        description: `Deleted ${Math.round(churnRatio * 100)}% of code (${commit.deletions} lines)`,
        commit,
        timestamp: commit.date,
        links: buildLinks(owner, repo, commit),
      });
    }
  }
  return anomalies;
}

export function detectFileAnomalies(
  commits: CommitWithStats[],
  owner: string,
  repo: string
): PatternAnomaly[] {
  const anomalies: PatternAnomaly[] = [];

  for (const commit of commits) {
    for (const file of commit.files) {
      if (SENSITIVE_PATTERNS.some((p) => p.test(file))) {
        anomalies.push({
          type: "file",
          severity: "critical",
          description: `Sensitive file modified: ${file}`,
          commit,
          timestamp: commit.date,
          links: buildLinks(owner, repo, commit),
        });
        break; // One per commit
      }
    }
  }
  return anomalies;
}
