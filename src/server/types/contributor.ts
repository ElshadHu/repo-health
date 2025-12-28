export type PRFileChange = {
  filename: string;
  status: "added" | "modified" | "removed" | "renamed";
  additions: number;
  deletions: number;
  diff: string | null;
};

export type PRReview = {
  reviewer: string;
  state: string;
  body: string;
};

export type PRLineComment = {
  path: string;
  line: number;
  body: string;
  codeContext: string;
};

export type RejectedPRDetails = {
  number: number;
  title: string;
  files: PRFileChange[];
  reviews: PRReview[];
  lineComments: PRLineComment[];
};

export type PitfallAnalysis = {
  prNumber: number;
  mistake: string;
  reviewFeedback: string;
  advice: string;
  category: "tests" | "style" | "scope" | "setup" | "breaking" | "docs";
};

export type PitfallsResult = {
  analyses: PitfallAnalysis[];
  patterns: string[];
  analyzedCount: number;
};
