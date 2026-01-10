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
import { SetupStats } from "./SetupStats";
import { QuickStartCommand } from "./QuickStartCommand";
import { SetupChecklist } from "./SetupChecklist";
import { CommonGotchas } from "./CommonGotchas";
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

  if (error || !data) {
    return null;
  }

  // Count env vars from issues
  const envIssue = data.criticalIssues.find((i) => i.id === "env-vars");
  const envVarCount = envIssue
    ? parseInt(envIssue.title.match(/\d+/)?.[0] || "0")
    : 0;

  return (
    <VStack align="stretch" gap={4}>
      {/* Header */}
      <HStack justify="space-between">
        <HStack gap={2}>
          <FaWrench color="#f0883e" />
          <Text fontSize="xl" fontWeight="bold" color="#f0f6fc">
            Setup Guide
          </Text>
        </HStack>
        {data.dataSource.type === "ci-analyzed" && (
          <Badge
            bg="#58a6ff11"
            color="#58a6ff"
            p={2}
            border="1px solid #58a6ff"
          >
            Based on {data.dataSource.ciRunsAnalyzed} CI failures
          </Badge>
        )}
      </HStack>

      {/* Quick Start & Checklist Row */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <SetupStats
          issueCount={data.criticalIssues.length}
          envVarCount={envVarCount}
          firstIssueTitle={data.criticalIssues[0]?.title}
        />
        {data.quickStart && (
          <QuickStartCommand command={data.quickStart.command} />
        )}
        {data.setupSteps && data.setupSteps.length > 0 && (
          <SetupChecklist steps={data.setupSteps} />
        )}
        <CommonGotchas issues={data.criticalIssues} />
      </SimpleGrid>

      {/* Best Practices */}
      {(data.dosDonts.dos.length > 0 || data.dosDonts.donts.length > 0) && (
        <Box>
          <Text color="#f0f6fc" fontWeight="600" fontSize="md" mb={3}>
            Best Practices
          </Text>
          <DosDonts data={data.dosDonts} />
        </Box>
      )}
    </VStack>
  );
}
