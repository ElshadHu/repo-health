export type FundingPlatform =
  | "github"
  | "open_collective"
  | "ko_fi"
  | "buy_me_a_coffee"
  | "patreon"
  | "tidelift"
  | "community_bridge"
  | "liberapay"
  | "issuehunt"
  | "polar"
  | "thanks_dev"
  | "custom";

export type FundingLink = {
  platform: FundingPlatform;
  url: string;
  label: string;
};

export type FundingInfo = {
  links: FundingLink[];
  hasFunding: boolean;
};

// Raw FUNDING.yml structure (internal use)
export type RawFundingYml = {
  github?: string | string[];
  open_collective?: string;
  ko_fi?: string;
  buy_me_a_coffee?: string;
  patreon?: string;
  tidelift?: string;
  community_bridge?: string;
  liberapay?: string;
  issuehunt?: string;
  polar?: string;
  thanks_dev?: string;
  custom?: string[];
};
