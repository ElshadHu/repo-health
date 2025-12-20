"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Input,
  Button,
  HStack,
  VStack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { FaTimes, FaLock, FaGlobe } from "react-icons/fa";
import { trpc } from "@/trpc/client";
import { useSession } from "next-auth/react";
import Fuse from "fuse.js";

type RepoSearchInputProps = {
  onSearch: (owner: string, repo: string) => void;
  isLoading?: boolean;
  onClear?: () => void;
};

type RepoSuggestion = {
  fullName: string;
  owner: string;
  name: string;
  private: boolean;
};

export function RepoSearchInput({
  onSearch,
  onClear,
  isLoading,
}: RepoSearchInputProps) {
  const { status } = useSession();
  const isSignedIn = status === "authenticated";

  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (repoUrl.length >= 2) {
        setDebouncedQuery(repoUrl);
      } else {
        setDebouncedQuery("");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [repoUrl]);

  const { data: userRepos } = trpc.user.getMyRepos.useQuery(undefined, {
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 5,
  });

  const { data: searchResults } = trpc.user.searchRepos.useQuery(
    { query: debouncedQuery },
    {
      enabled: debouncedQuery.length >= 2,
      staleTime: 1000 * 60,
    }
  );

  // Combine all repos for Fuse.js search
  const allRepos = useMemo(() => {
    const repos: RepoSuggestion[] = [];
    const seen = new Set<string>();

    if (userRepos) {
      for (const repo of userRepos) {
        if (!seen.has(repo.fullName)) {
          repos.push({
            fullName: repo.fullName,
            owner: repo.owner,
            name: repo.name,
            private: repo.private,
          });
          seen.add(repo.fullName);
        }
      }
    }

    if (searchResults) {
      for (const repo of searchResults) {
        if (!seen.has(repo.fullName)) {
          repos.push(repo);
          seen.add(repo.fullName);
        }
      }
    }

    return repos;
  }, [userRepos, searchResults]);

  const fuse = useMemo(
    () =>
      new Fuse(allRepos, {
        keys: [
          { name: "fullName", weight: 2 },
          { name: "name", weight: 1.5 },
          { name: "owner", weight: 1 },
        ],
        threshold: 0.4,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    [allRepos]
  );

  const suggestions: RepoSuggestion[] = useMemo(() => {
    if (!repoUrl || repoUrl.length < 2) return [];

    const results = fuse.search(repoUrl);
    return results.slice(0, 8).map((result) => result.item);
  }, [repoUrl, fuse]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const parseGitHubUrl = (url: string) => {
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\s]+)/,
      /^([^\/\s]+)\/([^\/\s]+)$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return { owner: match[1], repo: match[2].replace(/\/git$/, "") };
      }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowDropdown(false);
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      setError("Please enter a valid GitHub URL or owner/repo format");
      return;
    }
    onSearch(parsed.owner, parsed.repo);
  };

  const handleSelectSuggestion = (suggestion: RepoSuggestion) => {
    setRepoUrl(suggestion.fullName);
    setShowDropdown(false);
    onSearch(suggestion.owner, suggestion.name);
  };

  const handleClear = () => {
    setRepoUrl("");
    setError("");
    setShowDropdown(false);
    onClear?.();
  };

  return (
    <Box as="form" onSubmit={handleSubmit} position="relative">
      <VStack gap={4} align="stretch">
        <VStack align="start" gap={2}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
            Repository to Analyze
          </Text>
          <Text fontSize="sm" color="gray.600">
            Enter GitHub URL or owner/repo (e.g., &quot;facebook/react&quot;)
          </Text>
        </VStack>

        <HStack>
          <Box position="relative" flex="1">
            <Input
              ref={inputRef}
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="facebook/react or https://github.com/facebook/react"
              size="lg"
              disabled={isLoading}
              color="gray.800"
              bg="white"
              borderColor="gray.300"
              _placeholder={{ color: "gray.400" }}
              autoComplete="off"
            />

            {/* Autocomplete Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <Box
                ref={dropdownRef}
                position="absolute"
                top="100%"
                left={0}
                right={0}
                mt={1}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                boxShadow="lg"
                zIndex={100}
                maxH="300px"
                overflowY="auto"
              >
                {suggestions.map((suggestion) => (
                  <HStack
                    key={suggestion.fullName}
                    px={4}
                    py={3}
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    justify="space-between"
                  >
                    <Text fontSize="sm" color="gray.800">
                      {suggestion.fullName}
                    </Text>
                    {suggestion.private ? (
                      <FaLock color="#8b949e" size={12} />
                    ) : (
                      <FaGlobe color="#8b949e" size={12} />
                    )}
                  </HStack>
                ))}
              </Box>
            )}
          </Box>

          {repoUrl && (
            <IconButton
              aria-label="Clear input"
              onClick={handleClear}
              size="lg"
              variant="ghost"
              colorPalette="gray"
            >
              <FaTimes />
            </IconButton>
          )}
          <Button
            type="submit"
            colorPalette="blue"
            size="lg"
            loading={isLoading}
            px={8}
            _active={{ transform: "scale(0.95)" }}
          >
            {isLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </HStack>

        {error && (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        )}
      </VStack>
    </Box>
  );
}
