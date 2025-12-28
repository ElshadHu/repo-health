"use client";

import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Flex,
  Link as ChakraLink,
} from "@chakra-ui/react";
import {
  FaExclamationTriangle,
  FaChartPie,
  FaClock,
  FaListUl,
  FaExternalLinkAlt,
  FaArrowLeft,
} from "react-icons/fa";
import Link from "next/link";
import { Button } from "@chakra-ui/react";
import { PitfallsTable } from "./PitfallsTable";
import { QuickTipsCard } from "./QuickTipsCard";
import { SpammerSection } from "./SpammerSection";
import type { PitfallAnalysis, SpammerProfile } from "@/server/types";
import { useMemo } from "react";

type Props = {
  analyses: PitfallAnalysis[];
  patterns: string[];
  spammers: SpammerProfile[];
  owner: string;
  repo: string;
};

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <Box
      bg="#161b22"
      border="1px solid #30363d"
      borderRadius="lg"
      p={5}
      _hover={{ borderColor: "#58a6ff" }}
      transition="border-color 0.2s"
    >
      <HStack gap={3} mb={2}>
        <Box color="#58a6ff">{icon}</Box>
        <Text color="#8b949e" fontSize="sm">
          {label}
        </Text>
      </HStack>
      <Text color="#c9d1d9" fontSize="2xl" fontWeight="bold">
        {value}
      </Text>
      {subtext && (
        <Text color="#6e7681" fontSize="xs" mt={1}>
          {subtext}
        </Text>
      )}
    </Box>
  );
}

export function PitfallsPage({
  analyses,
  patterns,
  spammers,
  owner,
  repo,
}: Props) {
  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of analyses) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [analyses]);

  // Find top category
  const topCategory = useMemo(() => {
    let max = 0;
    let top = "none";
    for (const [cat, count] of Object.entries(categoryCounts)) {
      if (count > max) {
        max = count;
        top = cat;
      }
    }
    return { category: top, count: max };
  }, [categoryCounts]);

  // Empty state
  if (analyses.length === 0) {
    return (
      <Box maxW="1200px" mx="auto" p={{ base: 4, md: 8 }}>
        <Link href={`/?owner=${owner}&repo=${repo}`}>
          <Button
            variant="ghost"
            color="#8b949e"
            _hover={{ color: "#c9d1d9", bg: "#21262d" }}
            mb={6}
          >
            <FaArrowLeft />
            <Text ml={2}>Back to Analysis</Text>
          </Button>
        </Link>

        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="50vh"
          textAlign="center"
        >
          <Box bg="rgba(35, 134, 54, 0.15)" p={4} borderRadius="full" mb={4}>
            <FaExclamationTriangle color="#238636" size={32} />
          </Box>
          <Text fontSize="xl" fontWeight="bold" color="#c9d1d9" mb={2}>
            No Contribution Insights Found
          </Text>
          <Text color="#8b949e" maxW="400px">
            Great news! No rejected community PRs were found in this repository.
            This repo appears welcoming to new contributors.
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" p={{ base: 4, md: 8 }}>
      {/* Back Button */}
      <Link href={`/?owner=${owner}&repo=${repo}`}>
        <Button
          variant="ghost"
          color="#8b949e"
          _hover={{ color: "#c9d1d9", bg: "#21262d" }}
          mb={6}
        >
          <FaArrowLeft />
          <Text ml={2}>Back to Analysis</Text>
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
        <HStack gap={3}>
          <Box bg="rgba(240, 136, 62, 0.15)" p={2} borderRadius="md">
            <FaExclamationTriangle size={28} color="#f0883e" />
          </Box>
          <VStack align="start" gap={0}>
            <Text fontSize="2xl" fontWeight="bold" color="#c9d1d9">
              Contribution Insights
            </Text>
            <Text fontSize="sm" color="#8b949e">
              {owner}/{repo}
            </Text>
          </VStack>
        </HStack>
        <ChakraLink
          href={`https://github.com/${owner}/${repo}/pulls?q=is%3Apr+is%3Aclosed`}
          target="_blank"
          color="#58a6ff"
          fontSize="sm"
          display="flex"
          alignItems="center"
          gap={2}
        >
          View PRs on GitHub <FaExternalLinkAlt size={12} />
        </ChakraLink>
      </Flex>

      {/* Stats Grid */}
      <Grid
        templateColumns={{
          base: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={4}
        mb={8}
      >
        <StatCard
          icon={<FaChartPie size={18} />}
          label="PRs Analyzed"
          value={analyses.length}
          subtext="From community contributors"
        />
        <StatCard
          icon={<FaExclamationTriangle size={18} />}
          label="Top Reason"
          value={topCategory.category}
          subtext={`${topCategory.count} PRs rejected for this`}
        />
        <StatCard
          icon={<FaListUl size={18} />}
          label="Categories"
          value={Object.keys(categoryCounts).length}
          subtext="Different failure patterns"
        />
        <StatCard
          icon={<FaClock size={18} />}
          label="Patterns Found"
          value={patterns.length}
          subtext="Common mistake themes"
        />
      </Grid>

      {/* Tips Card */}
      {patterns.length > 0 && (
        <Box mb={8}>
          <QuickTipsCard patterns={patterns} />
        </Box>
      )}

      {/* Spammer Section */}
      <SpammerSection spammers={spammers} owner={owner} repo={repo} />

      {/* Table */}
      <PitfallsTable analyses={analyses} owner={owner} repo={repo} />
    </Box>
  );
}
