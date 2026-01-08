// Parse CONTRIBUTING.md and .env.example

export function parseContributing(content: string | null): {
  prerequisites: string[];
  setupSteps: string[];
} {
  if (!content) return { prerequisites: [], setupSteps: [] };

  const prerequisites: string[] = [];
  const setupSteps: string[] = [];

  // Prerequisites section
  const prereqMatch = content.match(
    /##?\s*(?:prerequisites?|requirements?|before you begin|what you.?ll need)/i
  );
  if (prereqMatch?.index !== undefined) {
    const section = content.slice(prereqMatch.index, prereqMatch.index + 1500);
    const items = section.match(/[-*]\s+(.+?)(?=\n|$)/g) || [];
    prerequisites.push(
      ...items.slice(0, 10).map((item) => item.replace(/^[-*]\s+/, "").trim())
    );
  }

  // Setup section
  const setupMatch = content.match(
    /##?\s*(?:setup|installation|getting started|development|local development)/i
  );
  if (setupMatch?.index !== undefined) {
    const section = content.slice(setupMatch.index, setupMatch.index + 2000);
    const numbered = section.match(/\d+\.\s+(.+?)(?=\n|$)/g) || [];
    setupSteps.push(
      ...numbered
        .slice(0, 15)
        .map((item) => item.replace(/^\d+\.\s+/, "").trim())
    );
  }

  return { prerequisites, setupSteps };
}

export function parseEnvExample(content: string | null): string[] {
  if (!content) return [];
  const lines = content
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"));
  return lines
    .filter((l) => l.includes("="))
    .map((l) => l.split("=")[0].trim())
    .filter((v) => v.length > 0);
}
