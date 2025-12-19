"use client";

import { Box, Text, HStack, VStack, Flex, Badge } from "@chakra-ui/react";
import { FaBox, FaExclamationTriangle, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

type DependencySummary = {
  total: number;
  vulnerable: number;
  critical: number;
  high: number;
  moderate: number;
  low: number;
};

type Props = {
  summary: DependencySummary;
  owner: string;
  repo: string;
};

const SEVERITY_COLORS = {
  critical: { bg: "#f85149", label: "Critical" },
  high: { bg: "#db6d28", label: "High" },
  moderate: { bg: "#d29922", label: "Moderate" },
  low: { bg: "#238636", label: "Low" },
};

function SeverityBadge({
  count,
  severity,
}: {
  count: number;
  severity: keyof typeof SEVERITY_COLORS;
}) {
  const config = SEVERITY_COLORS[severity];
  if (count === 0) return null;

  return (
    <Badge
      bg={config.bg}
      color="white"
      px={3}
      py={1}
      borderRadius="full"
      fontSize="xs"
      fontWeight="bold"
      transition="transform 0.2s ease"
      _hover={{ transform: "scale(1.05)" }}
    >
      {count} {config.label}
    </Badge>
  );
}

export function DependencySummaryCard({ summary, owner, repo }: Props) {
  const hasVulnerabilities = summary.vulnerable > 0;

  return (
    <Link
      href={`/dependencies/${owner}/${repo}`}
      style={{ textDecoration: "none" }}
    >
      <Box
        bg="#161b22"
        border="1px solid #30363d"
        borderRadius="lg"
        p={6}
        cursor="pointer"
        transition="all 0.3s ease"
        _hover={{
          borderColor: hasVulnerabilities ? "#f85149" : "#238636",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
        role="group"
      >
        {/* Header */}
        <Flex justify="space-between" align="center" mb={4}>
          <HStack gap={3}>
            <Box
              bg={
                hasVulnerabilities
                  ? "rgba(248,81,73,0.15)"
                  : "rgba(35,134,54,0.15)"
              }
              p={2}
              borderRadius="md"
              transition="background 0.2s ease"
            >
              <FaBox
                color={hasVulnerabilities ? "#f85149" : "#238636"}
                size={20}
              />
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize="lg" fontWeight="bold" color="#c9d1d9">
                Dependencies
              </Text>
              <Text fontSize="sm" color="#8b949e">
                {summary.total} packages
              </Text>
            </VStack>
          </HStack>

          {/* Arrow */}
          <Box
            color="#8b949e"
            transition="all 0.2s ease"
            _groupHover={{ transform: "translateX(4px)", color: "#c9d1d9" }}
          >
            <FaArrowRight />
          </Box>
        </Flex>

        {/* Vulnerability Status */}
        {hasVulnerabilities ? (
          <VStack align="stretch" gap={3}>
            <HStack gap={2}>
              <FaExclamationTriangle color="#f85149" />
              <Text fontSize="sm" color="#f85149" fontWeight="medium">
                {summary.vulnerable} vulnerabilities found
              </Text>
            </HStack>

            {/* Severity Badges */}
            <HStack gap={2} flexWrap="wrap">
              <SeverityBadge count={summary.critical} severity="critical" />
              <SeverityBadge count={summary.high} severity="high" />
              <SeverityBadge count={summary.moderate} severity="moderate" />
              <SeverityBadge count={summary.low} severity="low" />
            </HStack>
          </VStack>
        ) : (
          <HStack gap={2}>
            <Box w="8px" h="8px" borderRadius="full" bg="#238636" />
            <Text fontSize="sm" color="#238636" fontWeight="medium">
              No known vulnerabilities
            </Text>
          </HStack>
        )}

        {/* View Details Hint */}
        <Text
          fontSize="xs"
          color="#6e7681"
          mt={4}
          transition="color 0.2s ease"
          _groupHover={{ color: "#8b949e" }}
        >
          Click to view details and related PRs →
        </Text>
      </Box>
    </Link>
  );
}
