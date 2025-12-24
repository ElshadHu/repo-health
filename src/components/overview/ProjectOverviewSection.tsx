"use client";

import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Badge,
  Grid,
} from "@chakra-ui/react";
import { FaProjectDiagram } from "react-icons/fa";
import { trpc } from "@/trpc/client";
import {
  EntryPointsList,
  KeyFilesList,
  ArchitectureLayers,
  WhereToLook,
  ArchitectureDiagram,
} from "./index";
import { CombinedScorePanel } from "@/components/cards/CombinedScorePanel";

type Props = {
  owner: string;
  repo: string;
};

export function ProjectOverviewSection({ owner, repo }: Props) {
  const { data, isLoading, error } = trpc.overview.analyze.useQuery(
    { owner, repo },
    { staleTime: 1000 * 60 * 60 }
  );

  if (isLoading) {
    return (
      <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={8}>
        <VStack gap={4}>
          <Spinner size="lg" color="#a371f7" />
          <Text color="#c9d1d9" fontWeight="600">
            project architecture is being analyzed ...
          </Text>
          <Text color="#6e7681" fontSize="sm">
            This may take a few seconds
          </Text>
        </VStack>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={6}>
        <Text color="#f85149">
          Error loading project overview: {error?.message || "Unknown error"}
        </Text>
      </Box>
    );
  }

  const {
    analysis,
    fileTree,
    fileCount,
    totalSize,
    fileIssueMap,
    healthScore,
  } = data;

  return (
    <VStack gap={6} align="stretch">
      {/* Combined Score Panel - Horizontal Layout */}
      <CombinedScorePanel
        score={healthScore.overallScore}
        breakdown={healthScore.breakdown}
        insights={analysis.scoreInsights}
        finalScore={healthScore.finalScore}
      />

      {/* Project Overview Card */}
      <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={6}>
        {/* Header */}
        <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
          <HStack gap={4}>
            <Box bg="rgba(163,113,247,0.15)" p={3} borderRadius="lg">
              <FaProjectDiagram size={24} color="#a371f7" />
            </Box>
            <Box>
              <Text fontSize="xl" fontWeight="bold" color="#c9d1d9">
                Project Overview
              </Text>
              <HStack color="#8b949e" fontSize="sm">
                <Text>
                  {owner}/{repo}
                </Text>
                <Text>• {fileCount} files</Text>
                <Text>• {(totalSize / 1024).toFixed(0)} KB</Text>
              </HStack>
            </Box>
          </HStack>
          <Badge
            bg="rgba(163,113,247,0.15)"
            color="#a371f7"
            px={4}
            py={2}
            fontSize="md"
            borderRadius="full"
            textTransform="capitalize"
          >
            {analysis.type}
          </Badge>
        </HStack>

        {/* Grid Layout */}
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} my={6}>
          <EntryPointsList
            entryPoints={analysis.entryPoints}
            owner={owner}
            repo={repo}
          />
          <KeyFilesList
            keyFiles={analysis.keyFiles}
            owner={owner}
            repo={repo}
          />
          <ArchitectureLayers layers={analysis.layers} />
          <WhereToLook
            whereToLook={analysis.whereToLook}
            owner={owner}
            repo={repo}
          />
        </Grid>

        {/* Architecture Diagram */}
        <ArchitectureDiagram
          fileTree={fileTree}
          owner={owner}
          repo={repo}
          fileIssueMap={fileIssueMap}
        />
      </Box>
    </VStack>
  );
}
