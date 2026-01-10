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
      prompt: `Analyze why these open PRs may have merge conflicts. Consider:
- Long wait times while other PRs got merged
- Possible scope creep from review comments
- Delays in maintainer response

PRs to analyze:
${JSON.stringify(prs, null, 2)}

For each PR, provide a brief reason (max 20 words) and category.`,
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
