"use client";

import {
  Box,
  Text,
  HStack,
  VStack,
  Badge,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { FaCodeBranch, FaExclamationTriangle, FaClock } from "react-icons/fa";
import type { MergeConflictFairness } from "@/server/types";

type Props = {
  stats: MergeConflictFairness;
};

export function MergeConflictRiskCard({ stats }: Props) {
  const { atRiskPRs, avgWaitDays } = stats;

  // No PRs at risk
  if (atRiskPRs.length === 0) {
    return (
      <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
        <HStack gap={3} mb={3}>
          <FaCodeBranch color="#238636" size={20} />
          <Text color="#c9d1d9" fontWeight="bold">
            Merge Conflict Risk
          </Text>
        </HStack>
        <Text color="#238636" fontSize="sm">
          ✓ No queue-delayed PRs detected
        </Text>
      </Box>
    );
  }

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={4}>
      {/* Header */}
      <HStack gap={3} mb={2}>
        <FaExclamationTriangle color="#f85149" size={20} />
        <Text color="#c9d1d9" fontWeight="bold">
          High Conflict Risk PRs
        </Text>
        <Badge bg="#f85149" color="white" px={2} py={1} borderRadius="md">
          {atRiskPRs.length} at risk
        </Badge>
      </HStack>

      {/* Explanation */}
      <Text color="#8b949e" fontSize="xs" mb={3}>
        These community PRs may have merge conflicts due to other PRs being
        merged while they wait. Avg wait: {avgWaitDays} days
      </Text>

      {/* At Risk PRs List */}
      <VStack align="stretch" gap={1.5}>
        {atRiskPRs.map((pr) => (
          <ChakraLink
            key={pr.number}
            href={pr.url}
            target="_blank"
            _hover={{ textDecoration: "none", outline: "none" }}
            _focus={{ outline: "none", boxShadow: "none" }}
            _focusVisible={{ outline: "none", boxShadow: "none" }}
          >
            <Box
              p={2}
              bg="#0d1117"
              borderRadius="md"
              borderLeft="3px solid #f85149"
              transition="all 0.2s"
              _hover={{ bg: "#21262d" }}
            >
              <HStack justify="space-between" mb={1}>
                <HStack flex={1} minW={0}>
                  <Text color="#58a6ff" fontWeight="medium" flexShrink={0}>
                    #{pr.number}
                  </Text>
                  <Text color="#c9d1d9" fontSize="sm" lineClamp={1}>
                    {pr.title}
                  </Text>
                </HStack>
              </HStack>
              <HStack gap={3} mt={2} flexWrap="wrap">
                <HStack gap={1}>
                  <FaClock color="#6e7681" size={10} />
                  <Text color="#6e7681" fontSize="xs">
                    {pr.daysSinceCreated}d waiting
                  </Text>
                </HStack>
                <Text color="#f85149" fontSize="xs">
                  {pr.prsMergedAfter} PRs merged since opened
                </Text>
                <Text color="#8b949e" fontSize="xs">
                  by {pr.author}
                </Text>
                {/* generated reason */}
                {pr.reason && (
                  <Text color="#d29922" fontSize="xs" fontStyle="italic">
                    {pr.reason}
                  </Text>
                )}
              </HStack>
            </Box>
          </ChakraLink>
        ))}
      </VStack>

      {/* Insight */}
      <Text color="#8b949e" fontSize="xs" mt={3}>
        Why are these PRs waiting? Check for excessive change requests, scope
        creep from reviews, or missing maintainer responses.
      </Text>
    </Box>
  );
}
