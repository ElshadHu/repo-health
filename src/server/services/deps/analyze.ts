// Main dependency analysis service

import { githubService } from "../github";
import { fetchVulns } from "./osv";
import { parsers, type ParsedDep, type ParserConfig } from "./parsers/registry";
import type {
  DependenciesResult,
  DependencyInfo,
  Ecosystem,
} from "../../types";

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

function createEmptyResult(): DependenciesResult {
  return {
    dependencies: [],
    devDependencies: [],
    summary: createEmptySummary(),
  };
}

async function detectParser(
  owner: string,
  repo: string,
  token?: string | null
): Promise<{ config: ParserConfig; content: string } | null> {
  for (const config of parsers) {
    for (const file of config.files) {
      const content = await githubService.getFileContent(
        owner,
        repo,
        file,
        token
      );
      if (content) {
        return { config, content };
      }
    }
  }
  return null;
}

async function buildDepInfo(
  dep: ParsedDep,
  ecosystem: Ecosystem
): Promise<DependencyInfo> {
  const vulns = await fetchVulns(dep.name, dep.version, ecosystem);
  return {
    name: dep.name,
    version: dep.version,
    vulnerabilities: vulns,
  };
}

function calculateSummary(deps: DependencyInfo[], devDeps: DependencyInfo[]) {
  const allVulns = [...deps, ...devDeps].flatMap((d) => d.vulnerabilities);
  return {
    total: deps.length + devDeps.length,
    vulnerable: allVulns.length,
    critical: allVulns.filter((v) => v.severity === "CRITICAL").length,
    high: allVulns.filter((v) => v.severity === "HIGH").length,
    moderate: allVulns.filter((v) => v.severity === "MEDIUM").length,
    low: allVulns.filter((v) => v.severity === "LOW").length,
  };
}

async function analyze(
  owner: string,
  repo: string,
  token?: string | null
): Promise<DependenciesResult> {
  const detected = await detectParser(owner, repo, token);
  if (!detected) return createEmptyResult();

  const { config, content } = detected;
  const allDeps = config.parse(content);
  console.log(`[deps] Ecosystem: ${config.ecosystem}`);
  console.log(`[deps] Found ${allDeps.length} packages:`, allDeps.slice(0, 5));
  const dependencies = await Promise.all(
    allDeps.map((dep) => buildDepInfo(dep, config.ecosystem))
  );

  const summary = calculateSummary(dependencies, []);
  return { dependencies, devDependencies: [], summary };
}

export const depsService = {
  analyze,
  searchRelatedPRs: githubService.searchRelatedPRs,
  checkIssueExists: githubService.checkIssueExists,
};
