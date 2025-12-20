// Python parser for requirements.txt and pyproject.toml

export type ParsedDep = {
  name: string;
  version: string;
};

function parseRequirementsTxt(content: string): ParsedDep[] {
  return content
    .split("\n")
    .filter(
      (line) => line.trim() && !line.startsWith("#") && !line.startsWith("-")
    )
    .map((line) => {
      // Handle: package==1.0.0, package>=1.0.0, package~=1.0.0
      const match = line.match(/^([a-zA-Z0-9_-]+)[=<>~!]+(.+)/);
      if (match) {
        return {
          name: match[1].toLowerCase(),
          version: match[2].split(",")[0].trim(),
        };
      }
      // Just package name, no version
      const nameOnly = line.trim().split(/[<>=!]/)[0];
      return { name: nameOnly.toLowerCase(), version: "" };
    })
    .filter((d) => d.name);
}

function parsePyprojectToml(content: string): ParsedDep[] {
  const deps: ParsedDep[] = [];

  // Find dependencies array in [project] section
  const depsMatch = content.match(/dependencies\s*=\s*\[([\s\S]*?)\]/);
  if (depsMatch) {
    const depsContent = depsMatch[1];
    // Match: "package>=1.0.0" or "package"
    const packageMatches = depsContent.matchAll(/"([^"]+)"/g);
    for (const match of packageMatches) {
      const dep = match[1];
      const parsed = dep.match(/^([a-zA-Z0-9_-]+)([<>=~!].+)?/);
      if (parsed) {
        deps.push({
          name: parsed[1].toLowerCase(),
          version: parsed[2]?.replace(/^[<>=~!]+/, "") || "",
        });
      }
    }
  }

  return deps;
}

export function parse(content: string): ParsedDep[] {
  // Detect if it's pyproject.toml or requirements.txt
  if (content.includes("[project]") || content.includes("dependencies = [")) {
    return parsePyprojectToml(content);
  }
  return parseRequirementsTxt(content);
}

export const files = ["requirements.txt", "pyproject.toml"];
export const ecosystem = "PyPI" as const;
