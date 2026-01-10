import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { conflictReasonSchema } from "./conflictReasonSchema";
import type { ConflictRiskPR } from "../../types";

export async function analyzeConflictReasons(
  prs: ConflictRiskPR[]
): Promise<Map<number, string>> {
  if (prs.length === 0) {
    return new Map();
  }

  try {
    const { output } = await generateText({
      model: openai("gpt-4o-mini"),
      output: Output.object({
        schema: conflictReasonSchema,
      }),
      prompt: `You are analyzing open PRs that may face merge conflicts because other PRs were merged while these waited.

For each PR, explain the likely conflict risk based on:
- How long it's been waiting (daysSinceCreated)
- How many PRs were merged after it was opened (prsMergedAfter)
- The PR title/scope

Generate a specific, actionable reason (30-50 words) that explains:
1. WHY this PR is at risk (e.g., "Extensive UI changes may conflict with 8 recently merged frontend PRs")
2. WHAT might have changed (based on merged PRs count and wait time)

Be specific. Avoid generic phrases like "possible scope change" or "potential delays".

PRs to analyze:
${JSON.stringify(prs, null, 2)}

Provide a clear, specific reason and category for each PR.`,
    });

    // Convert to Map for easy lookup
    const reasonMap = new Map<number, string>();
    for (const item of output.reasons) {
      reasonMap.set(item.prNumber, item.reason);
    }
    return reasonMap;
  } catch (error) {
    console.error("AI analysis failed:", error);
    return new Map(); // Graceful fallback
  }
}
