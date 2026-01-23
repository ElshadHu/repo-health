// this one batches multiple file fetches into ONE API call, saving rate limits

import { createOctokit } from "../github/shared";
import { SETUP_FILES_QUERY } from "./queries";
import type { SetupFilesResult, Ecosystem } from "../../types/setup";

type GraphQLResponse = {
  repository: {
    contributing?: { text: string };
    contributingLower?: { text: string };
    docsContributing?: { text: string };
    packageJson?: { text: string };
    nvmrc?: { text: string };
    requirementsTxt?: { text: string };
    pyprojectToml?: { text: string };
    setupPy?: { text: string };
    goMod?: { text: string };
    cargoToml?: { text: string };
    globalJson?: { text: string };
    cmakeLists?: { text: string };
    vcpkgJson?: { text: string };
    makefile?: { text: string };
    dockerCompose?: { text: string };
    dockerComposeYaml?: { text: string };
    toolVersions?: { text: string };
    envExample?: { text: string };
    envSample?: { text: string };
    readme?: { text: string };
    primaryLanguage?: { name: string };
    defaultBranchRef?: {
      name: string;
      target: { oid: string; committedDate: string };
    };
  };
};

function detectEcosystem(data: GraphQLResponse["repository"]): Ecosystem[] {
  const ecosystems: Ecosystem[] = [];
  // Check for config files first
  if (data.packageJson) ecosystems.push("node");
  if (data.requirementsTxt || data.pyprojectToml || data.setupPy)
    ecosystems.push("python");
  if (data.goMod) ecosystems.push("go");
  if (data.cargoToml) ecosystems.push("rust");
  if (data.globalJson) ecosystems.push("csharp");
  if (data.cmakeLists || data.vcpkgJson || data.makefile)
    ecosystems.push("cpp");
  // Fallback to primary language only if no config files detected
  if (ecosystems.length === 0) {
    const lang = data.primaryLanguage?.name?.toLowerCase();
    if (lang === "javascript" || lang === "typescript") ecosystems.push("node");
    else if (lang === "python") ecosystems.push("python");
    else if (lang === "go") ecosystems.push("go");
    else if (lang === "rust") ecosystems.push("rust");
    else if (lang === "c#") ecosystems.push("csharp");
    else if (lang === "c++" || lang === "c") ecosystems.push("cpp");
    else ecosystems.push("unknown");
  }

  return ecosystems;
}

export async function fetchSetupFiles(
  owner: string,
  repo: string,
  token?: string | null
): Promise<SetupFilesResult> {
  const octokit = createOctokit(token);
  const response = await octokit.graphql<GraphQLResponse>(SETUP_FILES_QUERY, {
    owner,
    repo,
  });
  const r = response.repository;
  const ecosystem = detectEcosystem(r);

  return {
    ecosystem,
    contributing:
      r.contributing?.text ||
      r.contributingLower?.text ||
      r.docsContributing?.text ||
      null,
    readme: r.readme?.text || null,
    envExample: r.envExample?.text || r.envSample?.text || null,
    // Node.js
    packageJson: r.packageJson ? JSON.parse(r.packageJson.text) : null,
    nvmrc: r.nvmrc?.text?.trim() || null,
    // Python
    requirementsTxt: r.requirementsTxt?.text || null,
    pyprojectToml: r.pyprojectToml?.text || null,
    // Go
    goMod: r.goMod?.text || null,
    // Rust
    cargoToml: r.cargoToml?.text || null,
    // C#
    globalJson: r.globalJson?.text || null,
    // C++
    cmakeLists: r.cmakeLists?.text || null,
    vcpkgJson: r.vcpkgJson?.text || null,
    makefile: r.makefile?.text || null,
    // Docker
    dockerCompose: r.dockerCompose?.text || r.dockerComposeYaml?.text || null,
    // Version managers
    toolVersions: r.toolVersions?.text || null,
    // Metadata
    primaryLanguage: r.primaryLanguage?.name || null,
    latestCommit: r.defaultBranchRef
      ? {
          hash: r.defaultBranchRef.target.oid,
          date: r.defaultBranchRef.target.committedDate,
        }
      : null,
  };
}
