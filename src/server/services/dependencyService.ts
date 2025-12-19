import { cacheService } from "@/lib/redis";
import { githubService } from "./github";
import type {
  DependenciesResult,
  DependencyInfo,
  Vulnerability,
} from "../types";

const OSV_API = "https://api.osv.dev/v1/querybatch";
const CACHE_TTL = {
  OSV: 7 * 24 * 60 * 60,
  COMMUNITY_PRS: 24 * 60 * 60,
};

function cleanVersion(version: string): string {
  return version.replace(/^[\^~>=<]/, "").split(" ")[0];
}

function mapSeverity(raw: string): Vulnerability["severity"] {
  const s = raw?.toUpperCase() || "";
  if (s.includes("CRITICAL")) return "CRITICAL";
  if (s.includes("HIGH")) return "HIGH";
  if (s.includes("MEDIUM") || s.includes("MODERATE")) return "MEDIUM";
  return "LOW";
}

function createEmptyResult(): DependenciesResult {
  return {
    dependencies: [],
    devDependencies: [],
    summary: createEmptySummary(),
  };
}

function createEmptySummary(): DependenciesResult["summary"] {
  return {
    total: 0,
    vulnerable: 0,
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
  };
}

async function fetchPackageJson(
  owner: string,
  repo: string,
  token?: string | null
) {
  try {
    const content = await githubService.getFileContent(
      owner,
      repo,
      "package.json",
      token
    );
    if (!content) {
      return null;
    }
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function extractDeps(packageJson: any, key: string) {
  const raw = packageJson?.[key] || {};
  return Object.entries(raw).map(([name, version]) => ({
    name,
    version: cleanVersion(version as string),
  }));
}

function parseOSVVuln(raw: any): Vulnerability {
  return {
    id: raw.id,
    severity: mapSeverity(
      raw.database_specific?.severity || raw.severity?.[0]?.type
    ),
    summary: raw.summary || "No description",
    fixedVersion: raw.affected?.[0]?.ranges?.[0]?.events?.find(
      (e: any) => e.fixed
    )?.fixed,
  };
}

async function fetchFromOSV(deps: { name: string; version: string }[]) {
  const response = await fetch(OSV_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      queries: deps.map((d) => ({
        package: { name: d.name, ecosystem: "npm" },
        version: d.version,
      })),
    }),
  });
  if (!response.ok) return [];
  return (await response.json()).results || [];
}

async function getVulnsForDep(
  name: string,
  version: string
): Promise<Vulnerability[]> {
  const cacheKey = `osv:${name}:${version}`;
  const cached = await cacheService.get<Vulnerability[]>(cacheKey);
  if (cached) return cached;
  const results = await fetchFromOSV([{ name, version }]);
  const vulns = (results[0]?.vulns || []).map(parseOSVVuln);
  await cacheService.set(cacheKey, vulns, CACHE_TTL.OSV);
  return vulns;
}

async function buildDepInfo(dep: {
  name: string;
  version: string;
}): Promise<DependencyInfo> {
  const vulns = await getVulnsForDep(dep.name, dep.version);
  return {
    name: dep.name,
    version: dep.version,
    vulnerabilities: vulns,
  };
}

function calculateSummary(deps: DependencyInfo[], devDeps: DependencyInfo[]) {
  const allVulns = [...deps, ...devDeps].flatMap((d) => d.vulnerabilities);
  const total = deps.length + devDeps.length;
  const vulnerable = allVulns.length;
  const critical = allVulns.filter((v) => v.severity === "CRITICAL").length;
  const high = allVulns.filter((v) => v.severity === "HIGH").length;
  const moderate = allVulns.filter((v) => v.severity === "MEDIUM").length;
  const low = allVulns.filter((v) => v.severity === "LOW").length;
  const summary: DependenciesResult["summary"] = {
    total,
    vulnerable,
    critical,
    high,
    moderate,
    low,
  };
  return summary;
}

async function analyze(
  owner: string,
  repo: string,
  token?: string | null
): Promise<DependenciesResult> {
  const packageJson = await fetchPackageJson(owner, repo, token);
  if (!packageJson) return createEmptyResult();
  const rawDeps = extractDeps(packageJson, "dependencies");
  const rawDevDeps = extractDeps(packageJson, "devDependencies");
  const dependencies = await Promise.all(rawDeps.map(buildDepInfo));
  const devDependencies = await Promise.all(rawDevDeps.map(buildDepInfo));
  const summary = calculateSummary(dependencies, devDependencies);
  return { dependencies, devDependencies, summary };
}

export const dependencyService = {
  analyze,
};
