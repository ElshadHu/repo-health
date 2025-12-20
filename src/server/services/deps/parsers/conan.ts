// C++ parser for conanfile.txt

export type ParsedDep = {
  name: string;
  version: string;
};

export function parse(content: string): ParsedDep[] {
  const deps: ParsedDep[] = [];
  const lines = content.split("\n");
  let inRequires = false;

  for (const line of lines) {
    if (line.trim() === "[requires]") {
      inRequires = true;
      continue;
    }
    if (line.startsWith("[")) {
      inRequires = false;
      continue;
    }
    if (inRequires && line.trim()) {
      // package/version@user/channel
      const match = line.match(/^([^\/]+)\/([^@\s]+)/);
      if (match) {
        deps.push({ name: match[1].trim(), version: match[2].trim() });
      }
    }
  }
  return deps;
}

export const files = ["conanfile.txt"];
export const ecosystem = "Conan" as const;
