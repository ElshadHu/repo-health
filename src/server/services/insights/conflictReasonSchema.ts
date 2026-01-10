import { z } from "zod";

export const conflictReasonSchema = z.object({
  reasons: z.array(
    z.object({
      prNumber: z.number().describe("The PR number"),
      reason: z
        .string()
        .describe("Why this PR has conflict risk, max 20 words"),
      category: z
        .enum(["scope_creep", "long_wait", "review_delays", "unclear"])
        .describe("The primary reason category"),
    })
  ),
});

export type ConflictReasonOutput = z.infer<typeof conflictReasonSchema>;
