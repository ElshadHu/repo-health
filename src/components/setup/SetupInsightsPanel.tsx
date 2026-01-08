"use client";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaWrench } from "react-icons/fa";
import { trpc } from "@/trpc/client";
import { IssueCard } from "./IssueCard";
import { TimeBreakDown } from "./TimeBreakDown";
import { DosDonts } from "./DosDonts";

export function SetupInsightsPanel({
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

  if (isLoading) {
    return (
      <Box
        bg="#161b22"
        border="1px solid #30363d"
        borderRadius="lg"
        p={8}
        textAlign="center"
      >
        <Spinner size="lg" color="#f0883e" />
        <Text color="#8b949e" mt={4}>
          Analyzing setup...
        </Text>
      </Box>
    );
  }

  if (error || !data) return null;

  // Count env vars from issues
  const envIssue = data.criticalIssues.find((i) => i.id === "env-vars");
  const envVarCount = envIssue
    ? parseInt(envIssue.title.match(/\d+/)?.[0] || "0")
    : 0;

  return (
    <VStack align="stretch" gap={6}>
      {/* Header */}
      <HStack justify="space-between">
        <HStack gap={2}>
          <FaWrench color="#f0883e" />
          <Text fontSize="xl" fontWeight="bold" color="#f0f6fc">
            Setup Guide
          </Text>
        </HStack>
        {data.dataSource.type === "ci-analyzed" && (
          <Badge colorPalette="blue">
            Based on {data.dataSource.ciRunsAnalyzed} CI failures
          </Badge>
        )}
      </HStack>

      {/* Hero Stats */}
      <SimpleGrid columns={3} gap={4}>
        <Box
          bg="#161b22"
          border="1px solid #30363d"
          borderRadius="lg"
          p={4}
          textAlign="center"
        >
          <Text color="#f0f6fc" fontSize="2xl" fontWeight="bold">
            ~{data.timeEstimate.totalMinutes}
          </Text>
          <Text color="#8b949e" fontSize="sm">
            Minutes to Setup
          </Text>
          <Text color="#58a6ff" fontSize="xs" mt={1}>
            {data.timeEstimate.accuracy === "calculated"
              ? "Based on CI data"
              : "Estimated"}
          </Text>
        </Box>
        <Box
          bg="#161b22"
          border="1px solid #30363d"
          borderRadius="lg"
          p={4}
          textAlign="center"
        >
          <Text color="#f0f6fc" fontSize="2xl" fontWeight="bold">
            {data.criticalIssues.length}
          </Text>
          <Text color="#8b949e" fontSize="sm">
            Setup Notes
          </Text>
          {data.criticalIssues[0] && (
            <Text
              color="#f0883e"
              fontSize="xs"
              mt={1}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {data.criticalIssues[0].title}
            </Text>
          )}
        </Box>
        <Box
          bg="#161b22"
          border="1px solid #30363d"
          borderRadius="lg"
          p={4}
          textAlign="center"
        >
          <Text color="#f0f6fc" fontSize="2xl" fontWeight="bold">
            {envVarCount}
          </Text>
          <Text color="#8b949e" fontSize="sm">
            Env Variables
          </Text>
          {envVarCount > 0 ? (
            <Text color="#a371f7" fontSize="xs" mt={1}>
              Copy .env.example
            </Text>
          ) : (
            <Text color="#3fb950" fontSize="xs" mt={1}>
              No setup needed
            </Text>
          )}
        </Box>
      </SimpleGrid>

      {/* Time Breakdown */}
      <TimeBreakDown data={data.timeEstimate} />

      {/* Issues */}
      {data.criticalIssues.length > 0 && (
        <>
          <Text color="#f0f6fc" fontWeight="600" fontSize="lg">
            Common Gotchas
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {data.criticalIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </SimpleGrid>
        </>
      )}

      {/* Dos and Donts */}
      {(data.dosDonts.dos.length > 0 || data.dosDonts.donts.length > 0) && (
        <>
          <Text color="#f0f6fc" fontWeight="600" fontSize="lg">
            Best Practices
          </Text>
          <DosDonts data={data.dosDonts} />
        </>
      )}
    </VStack>
  );
}
