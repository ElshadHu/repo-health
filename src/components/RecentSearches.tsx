"use client";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { FaHistory } from "react-icons/fa";

type RecentSearch = {
  owner: string;
  repo: string;
  fullName: string;
};

type RecentSearchesProps = {
  searches: RecentSearch[];
  onSelect: (owner: string, repo: string) => void;
  isLoading?: boolean;
};

export function RecentSearches({
  searches,
  onSelect,
  isLoading,
}: RecentSearchesProps) {
  if (isLoading) {
    return (
      <Box p={4}>
        <Text color="gray.400" fontSize="sm">
          Loading...
        </Text>
      </Box>
    );
  }

  if (searches.length === 0) {
    return (
      <Box p={4}>
        <Text color="gray.500" fontSize="sm">
          No recent searches
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={2} p={4}>
      <HStack gap={2} mb={1}>
        <FaHistory color="#8b949e" size={12} />
        <Text fontSize="xs" color="gray.500" fontWeight="medium">
          Recent Searches
        </Text>
      </HStack>
      {searches.map((search) => (
        <Box
          key={search.fullName}
          px={3}
          py={2}
          bg="gray.50"
          borderRadius="md"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ bg: "gray.100", transform: "translateX(4px)" }}
          onClick={() => onSelect(search.owner, search.repo)}
        >
          <Text fontSize="sm" color="gray.700" fontWeight="medium">
            {search.fullName}
          </Text>
        </Box>
      ))}
    </VStack>
  );
}
