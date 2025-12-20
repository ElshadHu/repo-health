// Rust parser for Cargo.toml

export type ParsedDep = {
  name: string;
  version: string;
};

export function parse(content: string): ParsedDep[] {
  const deps: ParsedDep[] = [];
  const lines = content.split("\n");
  let inDeps = false;

  for (const line of lines) {
    if (line.match(/^\[.*dependencies.*\]/)) {
      inDeps = true;
      continue;
    }
    if (line.startsWith("[") && !line.includes("dependencies")) {
      inDeps = false;
      continue;
    }
    if (inDeps) {
      // name = "1.0.0"
      const simple = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*"([^"]+)"/);
      // name = { version = "1.0.0" }
      const complex = line.match(
        /^([a-zA-Z0-9_-]+)\s*=.*version\s*=\s*"([^"]+)"/
      );
      if (simple) {
        deps.push({ name: simple[1], version: simple[2] });
      } else if (complex) {
        deps.push({ name: complex[1], version: complex[2] });
      }
    }
  }
  return deps;
}

export const files = ["Cargo.toml"];
export const ecosystem = "crates.io" as const;
