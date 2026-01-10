"use client";
import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import { SetupComplexityBadge } from "./SetupComplexityBadge";

interface SetupStatsProps {
  issueCount: number;
  envVarCount: number;
  firstIssueTitle?: string;
}

// Divider component
const StatsDivider = () => (
  <Box borderLeft="1px solid #30363d" height="40px" mx={4} />
);

export function SetupStats({
  issueCount,
  envVarCount,
  firstIssueTitle,
}: SetupStatsProps) {
  return (
    <Box
      bg="#161b22"
      border="1px solid #30363d"
      borderRadius="lg"
      p={4}
      alignContent="center"
    >
      <HStack justify="space-between" gap={2} flexWrap="wrap" width="100%">
        {/* Setup Complexity */}
        <VStack flex="1" minW="0">
          <SetupComplexityBadge
            issueCount={issueCount}
            envVarCount={envVarCount}
          />
        </VStack>

        <StatsDivider />

        {/* Setup Notes */}
        <VStack align="center" gap={2} flex="1" minW="0">
          <HStack gap={2}>
            <Text color="#f0f6fc" fontSize="lg" fontWeight="bold">
              {issueCount}
            </Text>
            <Text color="#8b949e" fontSize="sm">
              Setup Notes
            </Text>
          </HStack>
          {firstIssueTitle && (
            <Text
              color="#f0883e"
              fontSize="xs"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              maxW="300px"
            >
              {firstIssueTitle}
            </Text>
          )}
        </VStack>

        <StatsDivider />

        {/* Env Variables */}
        <VStack align="center" gap={2} flex="1" minW="0">
          <HStack gap={2}>
            <Text color="#f0f6fc" fontSize="lg" fontWeight="bold">
              {envVarCount}
            </Text>
            <Text color="#8b949e" fontSize="sm">
              Env Variables
            </Text>
          </HStack>
          {envVarCount > 0 ? (
            <Text color="#a371f7" fontSize="xs">
              Copy .env.example
            </Text>
          ) : (
            <Text color="#3fb950" fontSize="xs">
              No setup needed
            </Text>
          )}
        </VStack>
      </HStack>
    </Box>
  );
}
