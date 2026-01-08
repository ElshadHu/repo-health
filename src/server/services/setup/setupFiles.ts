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

function detectEcosystem(data: GraphQLResponse["repository"]): Ecosystem {
  // Check for config files first
  if (data.packageJson) return "node";
  if (data.requirementsTxt || data.pyprojectToml || data.setupPy)
    return "python";
  if (data.goMod) return "go";
  if (data.cargoToml) return "rust";
  if (data.globalJson) return "csharp";
  if (data.cmakeLists || data.vcpkgJson || data.makefile) return "cpp";
  // Fallback to primary language
  const lang = data.primaryLanguage?.name?.toLowerCase();
  if (lang === "javascript" || lang === "typescript") return "node";
  if (lang === "python") return "python";
  if (lang === "go") return "go";
  if (lang === "rust") return "rust";
  if (lang === "c#") return "csharp";
  if (lang === "c++" || lang === "c") return "cpp";
  return "unknown";
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
