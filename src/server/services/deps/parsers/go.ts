// Go parser for go.mod

export type ParsedDep = {
  name: string;
  version: string;
};

export function parse(content: string): ParsedDep[] {
  const deps: ParsedDep[] = [];
  const lines = content.split("\n");
  let inRequire = false;

  for (const line of lines) {
    if (line.trim() === "require (") {
      inRequire = true;
      continue;
    }
    if (line.trim() === ")") {
      inRequire = false;
      continue;
    }
    if (inRequire || line.startsWith("require ")) {
      const match = line.match(/^\s*([^\s]+)\s+v?([^\s]+)/);
      if (match && !match[2].includes("//")) {
        deps.push({ name: match[1], version: match[2].replace(/^v/, "") });
      }
    }
  }
  return deps;
}

export const files = ["go.mod"];
export const ecosystem = "Go" as const;
