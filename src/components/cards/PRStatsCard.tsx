"use client";

import { Box, Text, HStack, VStack, Flex, Badge } from "@chakra-ui/react";
import { FaCodeBranch, FaArrowRight, FaClock } from "react-icons/fa";
import Link from "next/link";
import type { PRStats } from "@/server/types";

type Props = {
  stats: PRStats;
  owner: string;
  repo: string;
};

export function PRStatsCard({ stats, owner, repo }: Props) {
  const mergeTimeDisplay =
    stats.avgMergeTimeHours < 24
      ? `${stats.avgMergeTimeHours}h`
      : `${Math.round(stats.avgMergeTimeHours / 24)}d`;

  return (
    <Link href={`/prs/${owner}/${repo}`} style={{ textDecoration: "none" }}>
      <Box
        bg="#161b22"
        border="1px solid #30363d"
        borderRadius="lg"
        p={6}
        minH="180px"
        cursor="pointer"
        transition="all 0.3s ease"
        _hover={{
          borderColor: "#58a6ff",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
        role="group"
      >
        {/* Header */}
        <Flex justify="space-between" align="center" mb={4}>
          <HStack gap={3}>
            <Box bg="rgba(88,166,255,0.15)" p={2} borderRadius="md">
              <FaCodeBranch color="#58a6ff" size={20} />
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize="lg" fontWeight="bold" color="#c9d1d9">
                Pull Requests
              </Text>
              <Text fontSize="sm" color="#8b949e">
                {stats.total} total
              </Text>
            </VStack>
          </HStack>
          <Box
            color="#8b949e"
            transition="all 0.2s ease"
            _groupHover={{ transform: "translateX(4px)", color: "#c9d1d9" }}
          >
            <FaArrowRight />
          </Box>
        </Flex>

        {/* Status Badges */}
        <HStack gap={2} flexWrap="wrap" mb={3}>
          <Badge
            bg="#238636"
            color="white"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
          >
            {stats.merged} Merged
          </Badge>
          <Badge
            bg="#58a6ff"
            color="white"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
          >
            {stats.open} Open
          </Badge>
        </HStack>

        {/* Merge Time */}
        <HStack gap={2} color="#6e7681" fontSize="xs">
          <FaClock size={12} />
          <Text>Avg merge: {mergeTimeDisplay}</Text>
        </HStack>

        {/* View Details Hint */}
        <Text
          fontSize="xs"
          color="#6e7681"
          mt={3}
          _groupHover={{ color: "#8b949e" }}
        >
          Click for detailed analytics →
        </Text>
      </Box>
    </Link>
  );
}
