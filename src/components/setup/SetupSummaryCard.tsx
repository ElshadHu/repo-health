"use client";
import { Box, VStack, HStack, Text, Badge } from "@chakra-ui/react";
import { FaWrench, FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import { trpc } from "@/trpc/client";

export function SetupSummaryCard({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const { data, isLoading, error } = trpc.setup.getInsights.useQuery(
    { owner, repo },
    { enabled: !!owner && !!repo, retry: false, staleTime: 300000 }
  );

  if (isLoading || error || !data) return null;

  const topIssue = data.criticalIssues[0];

  // Calculate complexity
  const envIssue = data.criticalIssues.find((i) => i.id === "env-vars");
  const envVarCount = envIssue
    ? parseInt(envIssue.title.match(/\d+/)?.[0] || "0")
    : 0;
  const score = data.criticalIssues.length * 2 + envVarCount;
  const complexity = score <= 3 ? "Easy" : score <= 7 ? "Moderate" : "Advanced";
  const complexityColor =
    complexity === "Easy"
      ? "#3fb950"
      : complexity === "Moderate"
        ? "#f0883e"
        : "#f85149";

  return (
    <Link href={`/setup/${owner}/${repo}`} style={{ textDecoration: "none" }}>
      <Box
        bg="#161b22"
        border="1px solid #30363d"
        borderRadius="lg"
        p={5}
        cursor="pointer"
        _hover={{ borderColor: "#58a6ff" }}
        h="100%"
      >
        <VStack align="stretch" gap={3}>
          <HStack justify="space-between">
            <HStack gap={2}>
              <FaWrench color="#f0883e" />
              <Text color="#f0f6fc" fontWeight="600">
                Setup Guide
              </Text>
            </HStack>
            <HStack gap={2}>
              <Badge
                bg={`${complexityColor}33`}
                color={complexityColor}
                size="sm"
                border={`1px solid ${complexityColor}`}
              >
                {complexity}
              </Badge>
              <FaArrowRight color="#8b949e" />
            </HStack>
          </HStack>

          {topIssue && (
            <Box
              bg="#21262d"
              borderLeft="3px solid #58a6ff"
              borderRadius="md"
              p={3}
            >
              <Text color="#f0f6fc" fontSize="13px" fontWeight="500">
                {topIssue.title}
              </Text>
              {topIssue.solution.command && (
                <Text color="#79c0ff" fontSize="12px" fontFamily="mono">
                  {topIssue.solution.command}
                </Text>
              )}
            </Box>
          )}
        </VStack>
      </Box>
    </Link>
  );
}
