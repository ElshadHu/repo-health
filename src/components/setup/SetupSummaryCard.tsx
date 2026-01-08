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
            <FaArrowRight color="#8b949e" />
          </HStack>

          <HStack gap={2}>
            <Text color="#8b949e" fontSize="sm">
              ~{data.timeEstimate.totalMinutes} min
            </Text>
            {data.dataSource.type === "ci-analyzed" && (
              <Badge colorPalette="blue" size="sm">
                Based on CI data
              </Badge>
            )}
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
