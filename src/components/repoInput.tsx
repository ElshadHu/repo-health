"use client";

import { useState } from "react";
import {
  Box,
  Input,
  Button,
  HStack,
  VStack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { FaTimes } from "react-icons/fa";

interface RepoSearchInputProps {
  onSearch: (owner: string, repo: string) => void;
  isLoading?: boolean;
  onClear?: () => void;
}

export function RepoSearchInput({
  onSearch,
  onClear,
  isLoading,
}: RepoSearchInputProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const parseGitHubUrl = (url: string) => {
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\s]+)/, // https://github.com/owner/repo
      /^([^\/\s]+)\/([^\/\s]+)$/, // owner/repo
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
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      setError("Please enter a valid GitHub URL or owner/repo format");
      return;
    }
    onSearch(parsed.owner, parsed.repo);
  };

  const handleClear = () => {
    setRepoUrl("");
    setError("");
    onClear?.();
  };
  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack gap={4} align="stretch">
        <VStack align="start" gap={2}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
            Repository to Analyze
          </Text>
          <Text fontSize="sm" color="gray.600">
            Enter GitHub URL or owner/repo (e.g., "facebook/react")
          </Text>
        </VStack>

        <HStack>
          <Input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="facebook/react or https://github.com/facebook/react"
            size="lg"
            disabled={isLoading}
            color="gray.800"
            bg="white"
            borderColor="gray.300"
            _placeholder={{ color: "gray.400" }}
          />
          {/* Clear Button  which shows when there's next */}
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
