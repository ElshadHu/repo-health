import { describe, it, expect, vi, beforeEach } from "vitest";

// mock data

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockCacheGet = vi.fn();
const mockCacheSet = vi.fn();
vi.mock("@/lib/redis", () => ({
  cacheService: {
    get: (...args: unknown[]) => mockCacheGet(...args),
    set: (...args: unknown[]) => mockCacheSet(...args),
  },
}));

const mockOctokitReposGet = vi.fn();
const mockOctokitListContributors = vi.fn();
vi.mock("@octokit/rest", () => {
  return {
    Octokit: class MockOctokit {
      rest = {
        repos: {
          get: mockOctokitReposGet,
          listContributors: mockOctokitListContributors,
        },
      };
    },
  };
});

import {
  fetchUnghRepo,
  fetchUnghContributors,
  fetchUnghFiles,
} from "@/lib/ungh";
import { getRepoInfo } from "../github/repoService";
import { getContributors } from "../github/activityService";

// test helpers

const mockGitHubRepoData = (overrides = {}) => ({
  data: {
    name: "repo",
    owner: { login: "owner" },
    description: "Test",
    html_url: "https://github.com/owner/repo",
    stargazers_count: 100,
    forks_count: 10,
    language: "TypeScript",
    open_issues_count: 5,
    default_branch: "main",
    created_at: "2020-01-01",
    updated_at: "2024-01-01",
    private: false,
    ...overrides,
  },
});

const mockUnghRepoData = (overrides = {}) => ({
  ok: true,
  json: async () => ({
    repo: {
      name: "repo",
      description: "Test",
      stars: 100,
      forks: 10,
      defaultBranch: "main",
      createdAt: "2020-01-01",
      updatedAt: "2024-01-01",
      ...overrides,
    },
  }),
});

// Tests the low-level UNGH fetch functions

describe("UNGH Client", () => {
  beforeEach(() => mockFetch.mockReset());

  describe("fetchUnghRepo", () => {
    it("returns repo data on success", async () => {
      mockFetch.mockResolvedValueOnce(mockUnghRepoData());
      const result = await fetchUnghRepo("owner", "repo");
      expect(result).toBeTruthy();
      expect(mockFetch).toHaveBeenCalledWith(
        "https://ungh.cc/repos/owner/repo"
      );
    });

    it("returns null when repo not found", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
      expect(await fetchUnghRepo("owner", "nonexistent")).toBeNull();
    });

    it("returns null on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      expect(await fetchUnghRepo("owner", "repo")).toBeNull();
    });
  });

  describe("fetchUnghContributors", () => {
    it("returns contributors on success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contributors: [{ id: 1, username: "user1", contributions: 100 }],
        }),
      });
      const result = await fetchUnghContributors("owner", "repo");
      expect(result).toHaveLength(1);
    });

    it("returns empty array when not found", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
      expect(await fetchUnghContributors("owner", "nonexistent")).toEqual([]);
    });
  });

  describe("fetchUnghFiles", () => {
    it("returns files on success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ files: [{ path: "src/index.ts", size: 1000 }] }),
      });
      const result = await fetchUnghFiles("owner", "repo", "main");
      expect(result).toHaveLength(1);
    });

    it("falls back to master branch if main fails", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ files: [{ path: "README.md" }] }),
      });
      const result = await fetchUnghFiles("owner", "repo");
      expect(result).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("returns empty array if both branches fail", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      mockFetch.mockResolvedValueOnce({ ok: false });
      expect(await fetchUnghFiles("owner", "repo")).toEqual([]);
    });
  });
});

// Integration Tests
// Tests UNGH + Redis cache + GitHub API routing logic

describe("UNGH + Cache Integration", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockCacheGet.mockReset();
    mockCacheSet.mockReset();
    mockOctokitReposGet.mockReset();
    mockOctokitListContributors.mockReset();
  });

  describe("getRepoInfo routing", () => {
    it("uses UNGH for unauthenticated requests", async () => {
      mockCacheGet.mockResolvedValue(null);
      mockFetch.mockResolvedValueOnce(mockUnghRepoData());

      const result = await getRepoInfo("owner", "repo", null);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://ungh.cc/repos/owner/repo"
      );
      expect(result.isPrivate).toBe(false);
    });

    it("uses GitHub API for authenticated requests", async () => {
      mockCacheGet.mockResolvedValue(null);
      mockOctokitReposGet.mockResolvedValueOnce(
        mockGitHubRepoData({ private: true })
      );

      const result = await getRepoInfo("owner", "repo", "token");

      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockOctokitReposGet).toHaveBeenCalled();
      expect(result.isPrivate).toBe(true);
    });
  });

  describe("getContributors routing", () => {
    it("uses UNGH for unauthenticated requests", async () => {
      mockCacheGet.mockResolvedValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contributors: [{ id: 1, username: "user1", contributions: 100 }],
        }),
      });

      const result = await getContributors("owner", "repo", null);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://ungh.cc/repos/owner/repo/contributors"
      );
      expect(result[0].username).toBe("user1");
    });

    it("uses GitHub API for authenticated requests", async () => {
      mockCacheGet.mockResolvedValue(null);
      mockOctokitListContributors.mockResolvedValueOnce({
        data: [
          { login: "user1", avatar_url: "", contributions: 50, html_url: "" },
        ],
      });

      await getContributors("owner", "repo", "token");

      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockOctokitListContributors).toHaveBeenCalled();
    });
  });
});

// checking security
// Critical tests for token handling, cache isolation, and data leakage prevention

describe("Security - Token & Cache", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockCacheGet.mockReset();
    mockCacheSet.mockReset();
    mockOctokitReposGet.mockReset();
  });

  // Token Hashing: Ensures raw tokens never appear in cache keys

  describe("Token Hashing", () => {
    it("never exposes raw tokens in cache keys", async () => {
      const token = "ghp_supersecrettoken123456789";
      mockCacheGet.mockResolvedValue(null);
      mockOctokitReposGet.mockResolvedValueOnce(mockGitHubRepoData());

      await getRepoInfo("owner", "repo", token);

      const cacheKey = mockCacheGet.mock.calls[0][0] as string;
      expect(cacheKey).not.toContain(token);
      expect(cacheKey).not.toContain("ghp_");
    });

    it("uses 8-char hex hash for authenticated cache keys", async () => {
      mockCacheGet.mockResolvedValue(null);
      mockOctokitReposGet.mockResolvedValueOnce(mockGitHubRepoData());

      await getRepoInfo("owner", "repo", "token");

      const cacheKey = mockCacheGet.mock.calls[0][0] as string;
      expect(cacheKey).toMatch(/:[a-f0-9]{8}$/);
    });

    it("uses :public suffix for unauthenticated requests", async () => {
      mockCacheGet.mockResolvedValue(null);
      mockFetch.mockResolvedValueOnce(mockUnghRepoData());

      await getRepoInfo("owner", "repo", null);

      const cacheKey = mockCacheGet.mock.calls[0][0] as string;
      expect(cacheKey).toMatch(/:public$/);
    });
  });

  // Cross-User Isolation: Prevents User B from seeing User A's private data
  // Each user's token hashes to a different suffix, creating isolated cache entries

  describe("Cross-User Isolation", () => {
    it("different users get different cache keys for same repo", async () => {
      // User A fetches repo
      mockCacheGet.mockResolvedValueOnce(null);
      mockOctokitReposGet.mockResolvedValueOnce(
        mockGitHubRepoData({ private: true })
      );
      await getRepoInfo("owner", "repo", "alice-token");
      const keyA = mockCacheSet.mock.calls[0][0] as string;

      mockCacheGet.mockReset();
      mockCacheSet.mockReset();
      mockOctokitReposGet.mockReset();

      // User B fetches same repo - must get different cache key
      mockCacheGet.mockResolvedValueOnce(null);
      mockOctokitReposGet.mockResolvedValueOnce(
        mockGitHubRepoData({ private: true })
      );
      await getRepoInfo("owner", "repo", "bob-token");
      const keyB = mockCacheSet.mock.calls[0][0] as string;

      expect(keyA).not.toBe(keyB);
      expect(keyA).toMatch(/:[a-f0-9]{8}$/);
      expect(keyB).toMatch(/:[a-f0-9]{8}$/);
    });

    it("user B cannot access user A's cached private repo", async () => {
      // User B tries to access - their cache key is different, so cache miss
      // Then GitHub API rejects because User B doesn't have access
      mockCacheGet.mockResolvedValueOnce(null);
      const error = new Error("Not Found") as Error & { status: number };
      error.status = 404;
      mockOctokitReposGet.mockRejectedValueOnce(error);

      await expect(
        getRepoInfo("owner", "repo", "user-b-token")
      ).rejects.toThrow("REPO_NOT_FOUND_OR_PRIVATE");
    });

    it("public and authenticated caches are separate", async () => {
      // Public request
      mockCacheGet.mockResolvedValueOnce(null);
      mockFetch.mockResolvedValueOnce(mockUnghRepoData());
      await getRepoInfo("owner", "repo", null);
      const publicKey = mockCacheSet.mock.calls[0][0] as string;

      mockCacheGet.mockReset();
      mockCacheSet.mockReset();

      // Authenticated request for same repo
      mockCacheGet.mockResolvedValueOnce(null);
      mockOctokitReposGet.mockResolvedValueOnce(mockGitHubRepoData());
      await getRepoInfo("owner", "repo", "token");
      const authKey = mockCacheSet.mock.calls[0][0] as string;

      expect(publicKey).not.toBe(authKey);
      expect(publicKey).toContain(":public");
      expect(authKey).not.toContain(":public");
    });
  });

  describe("Defense in Depth", () => {
    it("rejects private data found in public cache (cache poisoning defense)", async () => {
      // If somehow private data ends up in public cache, code must still protect it
      mockCacheGet.mockResolvedValueOnce({ name: "repo", isPrivate: true });

      await expect(getRepoInfo("owner", "repo", null)).rejects.toThrow(
        "PRIVATE_REPO_REQUIRES_AUTH"
      );
    });

    it("UNGH is never called for authenticated requests", async () => {
      mockCacheGet.mockResolvedValue(null);
      mockOctokitReposGet.mockResolvedValueOnce(
        mockGitHubRepoData({ private: true })
      );

      await getRepoInfo("owner", "repo", "token");

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("UNGH fallback maintains public cache key", async () => {
      // When UNGH fails and we fallback to GitHub API, cache key must stay :public
      mockCacheGet.mockResolvedValue(null);
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      mockOctokitReposGet.mockResolvedValueOnce(mockGitHubRepoData());

      await getRepoInfo("owner", "repo", null);

      expect(mockCacheSet.mock.calls[0][0]).toContain(":public");
    });
  });
});
