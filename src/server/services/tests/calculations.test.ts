import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateActivityScore,
  calculateMaintenanceScore,
  calculateCommunityScore,
  calculateDocumentationScore,
  WEIGHTS,
} from "../calculations";
import type {
  RepoInfo,
  Commit,
  Contributor,
  CommunityHealth,
} from "../../types";

const createRepoInfo = (overrides: Partial<RepoInfo> = {}): RepoInfo => ({
  name: "test-repo",
  owner: "test-owner",
  description: "Test description",
  url: "https://github.com/test-owner/test-repo",
  stars: 100,
  forks: 20,
  language: "TypeScript",
  openIssues: 5,
  defaultBranch: "main",
  createdAt: "2020-01-01T00:00:00Z",
  updatedAt: new Date().toISOString(),
  isPrivate: false,
  ...overrides,
});

const createCommit = (overrides: Partial<Commit> = {}): Commit => ({
  sha: "abc123",
  message: "Test commit",
  author: "test-author",
  date: new Date().toISOString(),
  url: "https://github.com/test/commit/abc123",
  ...overrides,
});

const createContributor = (
  overrides: Partial<Contributor> = {}
): Contributor => ({
  username: "contributor",
  avatarUrl: "https://avatar.url",
  contributions: 10,
  url: "https://github.com/contributor",
  ...overrides,
});

const createCommunityHealth = (
  overrides: Partial<CommunityHealth> = {}
): CommunityHealth => ({
  hasReadme: true,
  hasLicense: true,
  hasContributing: true,
  hasCodeOfConduct: true,
  healthPercentage: 100,
  ...overrides,
});

const FROZEN_TIME = new Date("2025-01-15T12:00:00Z");

const daysAgo = (days: number): string => {
  const date = new Date(FROZEN_TIME);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

describe("calculateActivityScore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates correct recency points based on days since update", () => {
    // Fresh (0-7 days) = 30 points
    expect(
      calculateActivityScore([], createRepoInfo({ updatedAt: daysAgo(0) }))
    ).toBe(30);
    expect(
      calculateActivityScore([], createRepoInfo({ updatedAt: daysAgo(7) }))
    ).toBe(30);

    // Recent (8-30 days) = 20 points
    expect(
      calculateActivityScore([], createRepoInfo({ updatedAt: daysAgo(8) }))
    ).toBe(20);
    expect(
      calculateActivityScore([], createRepoInfo({ updatedAt: daysAgo(30) }))
    ).toBe(20);

    // Stale (31-90 days) = 10 points
    expect(
      calculateActivityScore([], createRepoInfo({ updatedAt: daysAgo(31) }))
    ).toBe(10);
    expect(
      calculateActivityScore([], createRepoInfo({ updatedAt: daysAgo(90) }))
    ).toBe(10);

    // Dead (91+ days) = 0 points
    expect(
      calculateActivityScore([], createRepoInfo({ updatedAt: daysAgo(91) }))
    ).toBe(0);
    expect(
      calculateActivityScore([], createRepoInfo({ updatedAt: daysAgo(365) }))
    ).toBe(0);
  });

  it("calculates correct commit points with caps", () => {
    const staleRepo = createRepoInfo({ updatedAt: daysAgo(100) });

    // 0 commits = 0 points
    expect(calculateActivityScore([], staleRepo)).toBe(0);

    // 13 commits (1/week) = ~10 commit points + 5 author = 15
    const commits13 = Array(13)
      .fill(null)
      .map(() => createCommit({ author: "same" }));
    expect(calculateActivityScore(commits13, staleRepo)).toBe(15);

    // 52+ commits caps at 40 + 5 author = 45
    const commits52 = Array(52)
      .fill(null)
      .map(() => createCommit({ author: "same" }));
    expect(calculateActivityScore(commits52, staleRepo)).toBe(45);

    // 1000 commits still caps at 45
    const commits1000 = Array(1000)
      .fill(null)
      .map(() => createCommit({ author: "same" }));
    expect(calculateActivityScore(commits1000, staleRepo)).toBe(45);
  });

  it("calculates correct author points with caps", () => {
    const staleRepo = createRepoInfo({ updatedAt: daysAgo(100) });

    // 6+ unique authors caps at 30 author points + minimal commit points = 35
    const commits = Array(7)
      .fill(null)
      .map((_, i) => createCommit({ author: `author${i}` }));
    expect(calculateActivityScore(commits, staleRepo)).toBe(35);

    // Duplicates are counted correctly (2 unique = 10 points)
    const duplicates = [
      createCommit({ author: "a" }),
      createCommit({ author: "a" }),
      createCommit({ author: "b" }),
    ];
    expect(
      calculateActivityScore(duplicates, staleRepo)
    ).toBeGreaterThanOrEqual(10);
  });

  it("handles edge cases without throwing", () => {
    // Empty commits
    expect(() => calculateActivityScore([], createRepoInfo())).not.toThrow();

    // Invalid date
    expect(() =>
      calculateActivityScore([], createRepoInfo({ updatedAt: "invalid" }))
    ).not.toThrow();

    // Undefined author
    const badCommits = [
      createCommit({ author: undefined as unknown as string }),
    ];
    expect(() =>
      calculateActivityScore(
        badCommits,
        createRepoInfo({ updatedAt: daysAgo(100) })
      )
    ).not.toThrow();

    // Future date gives max recency
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    expect(
      calculateActivityScore(
        [],
        createRepoInfo({ updatedAt: futureDate.toISOString() })
      )
    ).toBe(30);
  });

  it("respects score bounds (0-100)", () => {
    // Perfect activity = 100
    const freshRepo = createRepoInfo({ updatedAt: new Date().toISOString() });
    const manyCommits = Array(100)
      .fill(null)
      .map((_, i) => createCommit({ author: `a${i % 10}` }));
    expect(calculateActivityScore(manyCommits, freshRepo)).toBe(100);

    // Dead repo = 0
    expect(
      calculateActivityScore([], createRepoInfo({ updatedAt: daysAgo(365) }))
    ).toBe(0);

    // Never exceeds 100
    const extremeCommits = Array(1000)
      .fill(null)
      .map((_, i) => createCommit({ author: `a${i}` }));
    expect(
      calculateActivityScore(extremeCommits, freshRepo)
    ).toBeLessThanOrEqual(100);

    // Never negative
    expect(
      calculateActivityScore([], createRepoInfo({ updatedAt: daysAgo(10000) }))
    ).toBeGreaterThanOrEqual(0);
  });
});

describe("calculateMaintenanceScore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates correct issue ratio points", () => {
    const base = { updatedAt: daysAgo(100), createdAt: daysAgo(50) };

    // ratio < 0.05 = 50 points
    expect(
      calculateMaintenanceScore(
        createRepoInfo({ ...base, openIssues: 5, stars: 1000 })
      )
    ).toBeGreaterThanOrEqual(50);

    // ratio 0.05-0.09 = 40 points
    expect(
      calculateMaintenanceScore(
        createRepoInfo({ ...base, openIssues: 7, stars: 100 })
      )
    ).toBeGreaterThanOrEqual(40);

    // ratio 0.1-0.19 = 25 points
    expect(
      calculateMaintenanceScore(
        createRepoInfo({ ...base, openIssues: 15, stars: 100 })
      )
    ).toBeGreaterThanOrEqual(25);

    // ratio >= 0.2 = 10 points
    expect(
      calculateMaintenanceScore(
        createRepoInfo({ ...base, openIssues: 50, stars: 100 })
      )
    ).toBeGreaterThanOrEqual(10);
  });

  it("calculates correct age points", () => {
    const base = { updatedAt: daysAgo(100), stars: 1000, openIssues: 0 };

    // > 1 year = 25, 180-365 = 15, 90-180 = 10, < 90 = 5
    expect(
      calculateMaintenanceScore(
        createRepoInfo({ ...base, createdAt: daysAgo(400) })
      )
    ).toBe(75); // 50+25+0
    expect(
      calculateMaintenanceScore(
        createRepoInfo({ ...base, createdAt: daysAgo(200) })
      )
    ).toBe(65); // 50+15+0
    expect(
      calculateMaintenanceScore(
        createRepoInfo({ ...base, createdAt: daysAgo(100) })
      )
    ).toBe(60); // 50+10+0
    expect(
      calculateMaintenanceScore(
        createRepoInfo({ ...base, createdAt: daysAgo(30) })
      )
    ).toBe(55); // 50+5+0
  });

  it("calculates correct activity points", () => {
    const base = { createdAt: daysAgo(400), stars: 1000, openIssues: 0 };

    // within 30 days = 25, 31-90 = 15, > 90 = 0
    expect(
      calculateMaintenanceScore(
        createRepoInfo({ ...base, updatedAt: daysAgo(15) })
      )
    ).toBe(100); // 50+25+25
    expect(
      calculateMaintenanceScore(
        createRepoInfo({ ...base, updatedAt: daysAgo(60) })
      )
    ).toBe(90); // 50+25+15
    expect(
      calculateMaintenanceScore(
        createRepoInfo({ ...base, updatedAt: daysAgo(100) })
      )
    ).toBe(75); // 50+25+0
  });

  it("handles edge cases without throwing", () => {
    const base = { updatedAt: daysAgo(100), createdAt: daysAgo(50) };

    // 0 stars (division by zero)
    expect(() =>
      calculateMaintenanceScore(
        createRepoInfo({ ...base, stars: 0, openIssues: 10 })
      )
    ).not.toThrow();
    expect(
      calculateMaintenanceScore(
        createRepoInfo({ ...base, stars: 0, openIssues: 10 })
      )
    ).toBeGreaterThanOrEqual(50);

    // Negative values (API anomalies)
    expect(() =>
      calculateMaintenanceScore(
        createRepoInfo({ ...base, stars: -100, openIssues: 10 })
      )
    ).not.toThrow();
    expect(() =>
      calculateMaintenanceScore(
        createRepoInfo({ ...base, stars: 100, openIssues: -5 })
      )
    ).not.toThrow();

    // Very large star counts
    expect(() =>
      calculateMaintenanceScore(
        createRepoInfo({ stars: 1000000, openIssues: 100 })
      )
    ).not.toThrow();

    // Cap at 100
    expect(
      calculateMaintenanceScore(
        createRepoInfo({
          updatedAt: new Date().toISOString(),
          createdAt: daysAgo(1000),
          stars: 100000,
          openIssues: 0,
        })
      )
    ).toBeLessThanOrEqual(100);
  });
});

describe("calculateCommunityScore", () => {
  it("calculates correct star points (logarithmic, capped at 30)", () => {
    expect(
      calculateCommunityScore(createRepoInfo({ stars: 0, forks: 0 }), [])
    ).toBe(0);

    const score10 = calculateCommunityScore(
      createRepoInfo({ stars: 10, forks: 0 }),
      []
    );
    expect(score10).toBeGreaterThanOrEqual(10);
    expect(score10).toBeLessThanOrEqual(12);

    const score100 = calculateCommunityScore(
      createRepoInfo({ stars: 100, forks: 0 }),
      []
    );
    expect(score100).toBeGreaterThanOrEqual(20);
    expect(score100).toBeLessThanOrEqual(22);

    expect(
      calculateCommunityScore(createRepoInfo({ stars: 100000, forks: 0 }), [])
    ).toBe(30);
  });

  it("calculates correct fork points (capped at 30)", () => {
    expect(
      calculateCommunityScore(createRepoInfo({ stars: 0, forks: 0 }), [])
    ).toBe(0);
    expect(
      calculateCommunityScore(createRepoInfo({ stars: 0, forks: 100000 }), [])
    ).toBe(30);
  });

  it("calculates correct contributor points (4 per, capped at 40)", () => {
    const repo = createRepoInfo({ stars: 0, forks: 0 });

    expect(calculateCommunityScore(repo, [])).toBe(0);
    expect(calculateCommunityScore(repo, [createContributor()])).toBe(4);
    expect(
      calculateCommunityScore(
        repo,
        Array(15)
          .fill(null)
          .map(() => createContributor())
      )
    ).toBe(40);
  });

  it("respects score bounds and handles edge cases", () => {
    // Perfect repo = 100
    const popularRepo = createRepoInfo({ stars: 100000, forks: 50000 });
    const contributors = Array(20)
      .fill(null)
      .map(() => createContributor());
    expect(calculateCommunityScore(popularRepo, contributors)).toBe(100);

    // Never exceeds 100
    const extremeRepo = createRepoInfo({ stars: 1000000, forks: 500000 });
    expect(
      calculateCommunityScore(
        extremeRepo,
        Array(100)
          .fill(null)
          .map(() => createContributor())
      )
    ).toBeLessThanOrEqual(100);

    // Edge cases don't throw
    expect(() =>
      calculateCommunityScore(createRepoInfo({ stars: -100, forks: 0 }), [])
    ).not.toThrow();
    expect(() =>
      calculateCommunityScore(createRepoInfo({ stars: 0, forks: 0 }), [
        createContributor({ username: undefined }),
      ])
    ).not.toThrow();
  });
});

describe("calculateDocumentationScore", () => {
  it("calculates correct points for each doc type", () => {
    // README = 35, LICENSE = 25, CONTRIBUTING = 25, CODE_OF_CONDUCT = 15
    expect(
      calculateDocumentationScore(
        createCommunityHealth({
          hasReadme: true,
          hasLicense: false,
          hasContributing: false,
          hasCodeOfConduct: false,
        })
      )
    ).toBe(35);
    expect(
      calculateDocumentationScore(
        createCommunityHealth({
          hasReadme: false,
          hasLicense: true,
          hasContributing: false,
          hasCodeOfConduct: false,
        })
      )
    ).toBe(25);
    expect(
      calculateDocumentationScore(
        createCommunityHealth({
          hasReadme: false,
          hasLicense: false,
          hasContributing: true,
          hasCodeOfConduct: false,
        })
      )
    ).toBe(25);
    expect(
      calculateDocumentationScore(
        createCommunityHealth({
          hasReadme: false,
          hasLicense: false,
          hasContributing: false,
          hasCodeOfConduct: true,
        })
      )
    ).toBe(15);
  });

  it("calculates correct combined scores", () => {
    // All docs = 100
    expect(
      calculateDocumentationScore(
        createCommunityHealth({
          hasReadme: true,
          hasLicense: true,
          hasContributing: true,
          hasCodeOfConduct: true,
        })
      )
    ).toBe(100);

    // No docs = 0
    expect(
      calculateDocumentationScore(
        createCommunityHealth({
          hasReadme: false,
          hasLicense: false,
          hasContributing: false,
          hasCodeOfConduct: false,
        })
      )
    ).toBe(0);

    // Combinations
    expect(
      calculateDocumentationScore(
        createCommunityHealth({
          hasReadme: true,
          hasLicense: true,
          hasContributing: false,
          hasCodeOfConduct: false,
        })
      )
    ).toBe(60);
    expect(
      calculateDocumentationScore(
        createCommunityHealth({
          hasReadme: true,
          hasLicense: true,
          hasContributing: true,
          hasCodeOfConduct: false,
        })
      )
    ).toBe(85);
  });
});

// Weight tests

describe("WEIGHTS constant", () => {
  it("weights sum to 1.0 and all are positive", () => {
    const sum =
      WEIGHTS.ACTIVITY +
      WEIGHTS.MAINTENANCE +
      WEIGHTS.COMMUNITY +
      WEIGHTS.DOCUMENTATION;
    expect(sum).toBe(1.0);

    expect(WEIGHTS.ACTIVITY).toBeGreaterThan(0);
    expect(WEIGHTS.MAINTENANCE).toBeGreaterThan(0);
    expect(WEIGHTS.COMMUNITY).toBeGreaterThan(0);
    expect(WEIGHTS.DOCUMENTATION).toBeGreaterThan(0);
  });
});
