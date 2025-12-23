"use client";

import { useParams } from "next/navigation";
import {
  Box,
  Text,
  HStack,
  VStack,
  Badge,
  Spinner,
  Button,
  Grid,
  Flex,
} from "@chakra-ui/react";
import { FaProjectDiagram, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import {
  TechStackBadges,
  EntryPointsList,
  KeyFilesList,
  ArchitectureLayers,
  WhereToLook,
  ArchitectureDiagram,
} from "@/components/overview";

export default function OverviewPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const { data, isLoading, error } = trpc.overview.analyze.useQuery(
    { owner, repo },
    { staleTime: 1000 * 60 * 60 } // Cache for 1 hour on client
  );

  if (isLoading) {
    return (
      <Box
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap={4}>
          <Spinner size="xl" color="#a371f7" />
          <Text color="#c9d1d9" fontWeight="600">
            Analyzing Code Architecture...
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
      <Box p={8}>
        <Text color="#f85149">
          Error: {error?.message || "Failed to analyze"}
        </Text>
      </Box>
    );
  }

  const { analysis, fileTree, fileCount, totalSize } = data;

  return (
    <Box maxW="1200px" mx="auto" p={{ base: 4, md: 8 }}>
      {/* Back Button */}
      <Link href="/">
        <Button
          variant="ghost"
          color="#8b949e"
          _hover={{ color: "#c9d1d9", bg: "#21262d" }}
          mb={4}
        >
          <FaArrowLeft style={{ marginRight: "8px" }} />
          Back to Analysis
        </Button>
      </Link>

      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        mb={8}
        flexWrap="wrap"
        gap={4}
      >
        <HStack gap={4}>
          <Box bg="rgba(163,113,247,0.15)" p={3} borderRadius="lg">
            <FaProjectDiagram size={24} color="#a371f7" />
          </Box>
          <VStack align="start" gap={0}>
            <Text fontSize="2xl" fontWeight="bold" color="#c9d1d9">
              Project Overview
            </Text>
            <HStack>
              <Text color="#8b949e">
                {owner}/{repo}
              </Text>
              <Text color="#6e7681" fontSize="sm">
                • {fileCount} files
              </Text>
              <Text color="#6e7681" fontSize="sm">
                • {(totalSize / 1024).toFixed(0)} KB
              </Text>
            </HStack>
          </VStack>
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
      </Flex>

      {/* Tech Stack */}
      <TechStackBadges stack={analysis.stack} />

      {/* Grid Layout */}
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mb={6}>
        <EntryPointsList
          entryPoints={analysis.entryPoints}
          owner={owner}
          repo={repo}
        />
        <KeyFilesList keyFiles={analysis.keyFiles} owner={owner} repo={repo} />
        <ArchitectureLayers layers={analysis.layers} />
        <WhereToLook
          whereToLook={analysis.whereToLook}
          owner={owner}
          repo={repo}
        />
      </Grid>

      {/* Architecture Diagram */}
      <ArchitectureDiagram fileTree={fileTree} owner={owner} repo={repo} />
    </Box>
  );
}
