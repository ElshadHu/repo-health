import { cacheService } from "@/lib/redis";
import { githubService } from "./github";
import type {
  DependenciesResult,
  DependencyInfo,
  Vulnerability,
} from "../types";

const CACHE_TTL = {
  OSV: 7 * 24 * 60 * 60,
};

function cleanVersion(version: string): string {
  return version.replace(/^[\^~>=<]/, "").split(" ")[0];
}

function mapSeverity(raw: any): Vulnerability["severity"] {
  const dbSeverity = raw?.database_specific?.severity?.toUpperCase() || "";
  if (dbSeverity === "CRITICAL") return "CRITICAL";
  if (dbSeverity === "HIGH") return "HIGH";
  if (dbSeverity === "MODERATE" || dbSeverity === "MEDIUM") return "MEDIUM";
  if (dbSeverity === "LOW") return "LOW";

  const cvssScore = raw?.severity?.[0]?.score;
  if (cvssScore !== undefined) {
    if (cvssScore >= 9.0) return "CRITICAL";
    if (cvssScore >= 7.0) return "HIGH";
    if (cvssScore >= 4.0) return "MEDIUM";
    return "LOW";
  }

  const severityType = raw?.severity?.[0]?.type?.toUpperCase() || "";
  if (severityType.includes("CRITICAL")) return "CRITICAL";
  if (severityType.includes("HIGH")) return "HIGH";
  if (severityType.includes("MEDIUM") || severityType.includes("MODERATE"))
    return "MEDIUM";

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
    severity: mapSeverity(raw),
    summary: raw.summary || raw.details || "No description",
    fixedVersion: raw.affected?.[0]?.ranges?.[0]?.events?.find(
      (e: any) => e.fixed
    )?.fixed,
  };
}

// Use single query API to get full vulnerability details
async function fetchVulnsFromOSV(
  name: string,
  version: string
): Promise<Vulnerability[]> {
  try {
    const response = await fetch("https://api.osv.dev/v1/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        package: { name, ecosystem: "npm" },
        version,
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const vulns = (data.vulns || []).map(parseOSVVuln);
    return vulns;
  } catch {
    return [];
  }
}

async function getVulnsForDep(
  name: string,
  version: string
): Promise<Vulnerability[]> {
  const cacheKey = `osv:${name}:${version}`;
  const cached = await cacheService.get<Vulnerability[]>(cacheKey);
  if (cached) return cached;

  const vulns = await fetchVulnsFromOSV(name, version);
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
  searchRelatedPRs: githubService.searchRelatedPRs,
  checkIssueExists: githubService.checkIssueExists,
};
