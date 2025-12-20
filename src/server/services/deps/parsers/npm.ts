// NPM parser for package.json

export type ParsedDep = {
  name: string;
  version: string;
};

function cleanVersion(version: string): string {
  return version.replace(/^[\^~>=<]/, "").split(" ")[0];
}

export function parse(content: string): ParsedDep[] {
  try {
    const json = JSON.parse(content);
    const deps = json.dependencies || {};
    const devDeps = json.devDependencies || {};
    return Object.entries({ ...deps, ...devDeps }).map(([name, version]) => ({
      name,
      version: cleanVersion(version as string),
    }));
  } catch {
    return [];
  }
}

export const files = ["package.json"];
export const ecosystem = "npm" as const;
