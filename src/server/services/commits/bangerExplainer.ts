import OpenAI from "openai";
import { ScoredCommit, BangerCommit, BangerType } from "../../types";

// Extract scope from conventional commit: feat(auth): -> "auth"
function extractScope(message: string): string | null {
  const match = message.match(/^\w+\(([^)]+)\)/);
  return match ? match[1] : null;
}

function getTemplateExplanation(
  type: BangerType,
  message: string
): string | null {
  const scope = extractScope(message);
  switch (type) {
    case "breaking":
      return `Breaking change${scope ? ` in ${scope}` : ""} - requires migration`;
    case "security":
      return "Security patch addressing vulnerability";
    case "feature":
      return `New feature: ${scope || "functionality added"}`;
    case "fix":
      return `Bug fix: ${scope || "issue resolved"}`;
    case "refactor":
      return `Code refactoring${scope ? ` in ${scope}` : ""}`;
    case "perf":
      return `Performance improvement${scope ? ` for ${scope}` : ""}`;
    default:
      return null; //  Here this requires AI
  }
}

async function getAIExplanations(
  commits: ScoredCommit[]
): Promise<Map<string, string>> {
  const openai = new OpenAI();
  const map = new Map<string, string>();
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            'Explain each git commit in one sentence (max 12 words). Respond as JSON: {"explanations": ["...", "..."]}',
        },
        {
          role: "user",
          content: JSON.stringify(
            commits.map((c) => c.commit.message.slice(0, 150))
          ),
        },
      ],
      response_format: { type: "json_object" },
    });
    const content = response.choices[0].message.content;
    if (content) {
      const parsed = JSON.parse(content);
      commits.forEach((c, i) => {
        map.set(
          c.commit.sha,
          parsed.explanations[i] || "Significant code change"
        );
      });
    }
  } catch (error) {
    console.error("AI explanation error:", error);
    // Fallback on error
    commits.forEach((c) => {
      map.set(c.commit.sha, "Significant code change");
    });
  }
  return map;
}

// Templates first, AI fallback for unknowns
export async function explainBangers(
  scored: ScoredCommit[]
): Promise<BangerCommit[]> {
  const results: BangerCommit[] = [];
  const needsAI: ScoredCommit[] = [];
  // Try templates first
  for (const s of scored) {
    const explanation = getTemplateExplanation(s.type, s.commit.message);
    if (explanation) {
      results.push({
        sha: s.commit.sha,
        message: s.commit.message,
        author: s.commit.author,
        date: s.commit.date,
        url: s.commit.url,
        type: s.type,
        score: s.score,
        explanation,
      });
    } else {
      needsAI.push(s);
    }
  }
  // Batch AI call for unknowns only
  if (needsAI.length > 0) {
    const aiExplanations = await getAIExplanations(needsAI);
    for (const s of needsAI) {
      results.push({
        sha: s.commit.sha,
        message: s.commit.message,
        author: s.commit.author,
        date: s.commit.date,
        url: s.commit.url,
        type: s.type,
        score: s.score,
        explanation:
          aiExplanations.get(s.commit.sha) || "Significant code change",
      });
    }
  }
  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}
