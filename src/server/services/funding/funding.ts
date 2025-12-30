import { Octokit } from "@octokit/rest";
import yaml from "js-yaml";
import type { FundingInfo, FundingLink, RawFundingYml } from "../../types";
// config: platform key -> { url builder, label }
const PLATFORMS = {
  github: {
    buildUrl: (u: string) => `https://github.com/sponsors/${u}`,
    label: "GitHub Sponsors",
  },
  open_collective: {
    buildUrl: (u: string) => `https://opencollective.com/${u}`,
    label: "Open Collective",
  },
  ko_fi: {
    buildUrl: (u: string) => `https://ko-fi.com/${u}`,
    label: "Ko-fi",
  },
  buy_me_a_coffee: {
    buildUrl: (u: string) => `https://buymeacoffee.com/${u}`,
    label: "Buy Me a Coffee",
  },
  patreon: {
    buildUrl: (u: string) => `https://patreon.com/${u}`,
    label: "Patreon",
  },
  tidelift: {
    buildUrl: (u: string) => `https://tidelift.com/subscription/pkg/${u}`,
    label: "Tidelift",
  },
  community_bridge: {
    buildUrl: (u: string) =>
      `https://crowdfunding.lfx.linuxfoundation.org/projects/${u}`,
    label: "LFX Mentorship",
  },
  liberapay: {
    buildUrl: (u: string) => `https://liberapay.com/${u}`,
    label: "Liberapay",
  },
  issuehunt: {
    buildUrl: (u: string) => `https://issuehunt.io/r/${u}`,
    label: "IssueHunt",
  },
  polar: {
    buildUrl: (u: string) => `https://polar.sh/${u}`,
    label: "Polar",
  },
  thanks_dev: {
    buildUrl: (u: string) => `https://thanks.dev/d/gh/${u}`,
    label: "Thanks.dev",
  },
};
function normalizeFundingLinks(raw: RawFundingYml): FundingLink[] {
  const links: FundingLink[] = [];
  // 1. Handle GitHub which can be string or array
  if (raw.github) {
    const users = Array.isArray(raw.github) ? raw.github : [raw.github];
    for (const user of users) {
      links.push({
        platform: "github",
        url: PLATFORMS.github.buildUrl(user),
        label: PLATFORMS.github.label,
      });
    }
  }
  // 2. Handle all simple platforms
  if (raw.open_collective) {
    links.push({
      platform: "open_collective",
      url: PLATFORMS.open_collective.buildUrl(raw.open_collective),
      label: PLATFORMS.open_collective.label,
    });
  }
  if (raw.ko_fi) {
    links.push({
      platform: "ko_fi",
      url: PLATFORMS.ko_fi.buildUrl(raw.ko_fi),
      label: PLATFORMS.ko_fi.label,
    });
  }
  if (raw.buy_me_a_coffee) {
    links.push({
      platform: "buy_me_a_coffee",
      url: PLATFORMS.buy_me_a_coffee.buildUrl(raw.buy_me_a_coffee),
      label: PLATFORMS.buy_me_a_coffee.label,
    });
  }
  if (raw.patreon) {
    links.push({
      platform: "patreon",
      url: PLATFORMS.patreon.buildUrl(raw.patreon),
      label: PLATFORMS.patreon.label,
    });
  }
  if (raw.tidelift) {
    links.push({
      platform: "tidelift",
      url: PLATFORMS.tidelift.buildUrl(raw.tidelift),
      label: PLATFORMS.tidelift.label,
    });
  }
  if (raw.community_bridge) {
    links.push({
      platform: "community_bridge",
      url: PLATFORMS.community_bridge.buildUrl(raw.community_bridge),
      label: PLATFORMS.community_bridge.label,
    });
  }
  if (raw.liberapay) {
    links.push({
      platform: "liberapay",
      url: PLATFORMS.liberapay.buildUrl(raw.liberapay),
      label: PLATFORMS.liberapay.label,
    });
  }
  if (raw.issuehunt) {
    links.push({
      platform: "issuehunt",
      url: PLATFORMS.issuehunt.buildUrl(raw.issuehunt),
      label: PLATFORMS.issuehunt.label,
    });
  }
  if (raw.polar) {
    links.push({
      platform: "polar",
      url: PLATFORMS.polar.buildUrl(raw.polar),
      label: PLATFORMS.polar.label,
    });
  }
  if (raw.thanks_dev) {
    links.push({
      platform: "thanks_dev",
      url: PLATFORMS.thanks_dev.buildUrl(raw.thanks_dev),
      label: PLATFORMS.thanks_dev.label,
    });
  }
  // 3. Handle custom URLs
  if (raw.custom && Array.isArray(raw.custom)) {
    for (const url of raw.custom) {
      links.push({
        platform: "custom",
        url,
        label: "Support",
      });
    }
  }
  return links;
}

async function fetchFundingYml(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<RawFundingYml | null> {
  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: ".github/FUNDING.yml",
    });
    if ("content" in response.data) {
      const content = Buffer.from(response.data.content, "base64").toString();
      return yaml.load(content) as RawFundingYml;
    }
    return null;
  } catch (error) {
    const err = error as Error;
    console.error("Failed to fetch funding.yml", err);
    return null;
  }
}
type AnalyzeOptions = {
  owner: string;
  repo: string;
  token?: string | null;
};

async function analyzeFunding(options: AnalyzeOptions): Promise<FundingInfo> {
  const { owner, repo, token } = options;
  const octokit = new Octokit({ auth: token ?? undefined });

  const rawFunding = await fetchFundingYml(octokit, owner, repo);
  if (!rawFunding) {
    return { links: [], hasFunding: false };
  }
  const links = normalizeFundingLinks(rawFunding);
  return {
    links,
    hasFunding: links.length > 0,
  };
}
export const fundingService = { analyzeFunding };
