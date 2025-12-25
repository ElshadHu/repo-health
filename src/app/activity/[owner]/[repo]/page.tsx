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
} from "@chakra-ui/react";
import { FaChartLine, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { AnomalyStats } from "@/components/anomaly/AnomalyStats";
import { AnomalyTimeline } from "@/components/anomaly/AnomalyTimeline";

const GRADE_COLORS: Record<string, string> = {
  A: "#238636",
  B: "#3fb950",
  C: "#d29922",
  D: "#db6d28",
  F: "#f85149",
};

export default function ActivityPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const { data, isLoading, error } = trpc.anomaly.analyze.useQuery({
    owner,
    repo,
  });

  if (isLoading) {
    return (
      <Box
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap={4}>
          <Spinner size="xl" color="#58a6ff" />
          <Text color="#8b949e">Analyzing commits...</Text>
        </VStack>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="#f85149">Error: {error?.message || "Failed to load"}</Text>
      </Box>
    );
  }

  const gradeColor = GRADE_COLORS[data.grade];

  return (
    <Box maxW="1200px" mx="auto" p={{ base: 4, md: 8 }}>
      {/* Back Button */}
      <Link
        href={`/?owner=${owner}&repo=${repo}`}
        style={{ width: "fit-content" }}
      >
        <Button
          variant="ghost"
          color="#8b949e"
          _hover={{ color: "#c9d1d9", bg: "#21262d" }}
          mb={4}
        >
          <FaArrowLeft />
          <Text ml={2}>Back to Analysis</Text>
        </Button>
      </Link>

      {/* Header */}
      <HStack justify="space-between" mb={8} flexWrap="wrap" gap={4}>
        <HStack gap={3}>
          <FaChartLine size={28} color="#58a6ff" />
          <VStack align="start" gap={0}>
            <Text fontSize="2xl" fontWeight="bold" color="#c9d1d9">
              Activity Monitor
            </Text>
            <Text fontSize="sm" color="#8b949e">
              {owner}/{repo}
            </Text>
          </VStack>
        </HStack>
        <VStack align="end" gap={0}>
          <Badge
            fontSize="xl"
            px={4}
            py={2}
            bg={`${gradeColor}26`}
            color={gradeColor}
          >
            {data.grade} ({data.score}/100)
          </Badge>
          <Text fontSize="xs" color="#6e7681" mt={1}>
            Based on alert severity & frequency
          </Text>
        </VStack>
      </HStack>

      {/* Stats */}
      <AnomalyStats
        summary={data.summary}
        commitsAnalyzed={data.commitsAnalyzed}
      />

      {/* Timeline */}
      <AnomalyTimeline events={data.events} />
    </Box>
  );
}
