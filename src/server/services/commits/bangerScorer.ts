import { Commit, ScoredCommit, BangerType } from "../../types";
type Pattern = {
  regex: RegExp;
  type: BangerType;
  score: number;
};

const PATTERNS: Pattern[] = [
  { regex: /BREAKING|!:/i, type: "breaking", score: 50 },
  { regex: /^security|CVE-|vuln/i, type: "security", score: 40 },
  { regex: /^feat[:\(]/i, type: "feature", score: 30 },
  { regex: /^perf[:\(]/i, type: "perf", score: 25 },
  { regex: /^fix[:\(]/i, type: "fix", score: 20 },
  { regex: /^refactor[:\(]/i, type: "refactor", score: 15 },
];

export function scoreCommit(commit: Commit): ScoredCommit {
  let type: BangerType = "other";
  let score = 0;
  for (const pattern of PATTERNS) {
    if (pattern.regex.test(commit.message)) {
      type = pattern.type;
      score = pattern.score;
      break;
    }
  }

  // Bonuses
  if (/#\d+/.test(commit.message)) {
    score += 10;
  }
  if (commit.message.length > 100) {
    score += 5;
  }
  if (commit.message.includes("\n\n")) {
    score += 5;
  }
  const scoreResult: ScoredCommit = {
    commit,
    type,
    score,
  };
  return scoreResult;
}

export function getTopBangers(commits: Commit[], count = 5): ScoredCommit[] {
  // Score each commit based on message patterns
  const scored = commits.map(scoreCommit);
  const significant = scored.filter((commit) => commit.score > 0);
  const sorted = significant.sort(
    (current, next) => next.score - current.score
  );
  // Return only the top N
  return sorted.slice(0, count);
}
