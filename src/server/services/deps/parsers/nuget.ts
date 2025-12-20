// C# parser for packages.config

export type ParsedDep = {
  name: string;
  version: string;
};

export function parse(content: string): ParsedDep[] {
  const deps: ParsedDep[] = [];
  const matches = content.matchAll(/id="([^"]+)"\s+version="([^"]+)"/g);
  for (const match of matches) {
    deps.push({ name: match[1], version: match[2] });
  }
  return deps;
}

export const files = ["packages.config"];
export const ecosystem = "NuGet" as const;
