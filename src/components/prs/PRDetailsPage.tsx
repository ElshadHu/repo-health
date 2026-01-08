"use client";

import {
  Box,
  Grid,
  GridItem,
  Text,
  VStack,
  HStack,
  Badge,
  Flex,
  Link as ChakraLink,
} from "@chakra-ui/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  FaCodeBranch,
  FaClock,
  FaComments,
  FaRobot,
  FaFileAlt,
  FaFire,
  FaExternalLinkAlt,
  FaArrowLeft,
} from "react-icons/fa";
import Link from "next/link";
import { Button } from "@chakra-ui/react";
import type { PRStats } from "@/server/types";
import { ContributorSankey } from "./ContributorSankey";
import { AIInteractionCard } from "./AIInteractionCard";
import { MergeTimeChart } from "./MergeTimeChart";

const COLORS = {
  merged: "#238636",
  open: "#58a6ff",
  closed: "#8b949e",
  maintainer: "#58a6ff",
  community: "#238636",
  bots: "#a371f7",
};

// Custom tooltip for pie charts
function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0];
  const bgColor = data.payload.color || "#161b22";

  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const textColor = brightness < 128 ? "#ffffff" : "#000000";

  return (
    <Box
      bg={bgColor}
      border="1px solid #30363d"
      borderRadius="md"
      p={2}
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.3)"
    >
      <Text color={textColor} fontSize="sm" fontWeight="600">
        {data.name}: {data.value}
      </Text>
    </Box>
  );
}

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
      transition="all 0.2s"
      _hover={{ borderColor: "#58a6ff" }}
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

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
      <Text color="#c9d1d9" fontWeight="bold" mb={4}>
        {title}
      </Text>
      {children}
    </Box>
  );
}

function ChartLegend({
  items,
}: {
  items: { name: string; value: number; color: string }[];
}) {
  return (
    <HStack justify="center" gap={4} mt={4} flexWrap="wrap">
      {items.map((item) => (
        <HStack key={item.name} gap={1}>
          <Box w="10px" h="10px" borderRadius="full" bg={item.color} />
          <Text color="#8b949e" fontSize="xs">
            {item.name}: {item.value}
          </Text>
        </HStack>
      ))}
    </HStack>
  );
}

type Props = {
  stats: PRStats;
  owner: string;
  repo: string;
};

export function PRDetailsPage({ stats, owner, repo }: Props) {
  const statusData = [
    { name: "Merged", value: stats.merged, color: COLORS.merged },
    { name: "Open", value: stats.open, color: COLORS.open },
    {
      name: "Closed",
      value: stats.closed - stats.merged,
      color: COLORS.closed,
    },
  ];

  const authorData = [
    {
      name: "Maintainer",
      value: stats.authorBreakdown.maintainer,
      color: COLORS.maintainer,
    },
    {
      name: "Community",
      value: stats.authorBreakdown.community,
      color: COLORS.community,
    },
    { name: "Bots", value: stats.authorBreakdown.bots, color: COLORS.bots },
  ];

  const mergeTimeData = [
    {
      name: "Average",
      hours: stats.avgMergeTimeHours,
      days: Math.round(stats.avgMergeTimeHours / 24),
    },
    {
      name: "Median",
      hours: stats.medianMergeTimeHours,
      days: Math.round(stats.medianMergeTimeHours / 24),
    },
  ];

  const formatHours = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    return `${Math.round(hours / 24)}d`;
  };

  return (
    <Box maxW="1200px" mx="auto" p={{ base: 4, md: 8 }}>
      <Link
        href={`/?owner=${owner}&repo=${repo}`}
        style={{ width: "fit-content" }}
      >
        <Button
          variant="ghost"
          color="#8b949e"
          _hover={{ color: "#c9d1d9", bg: "#21262d" }}
        >
          <FaArrowLeft />
          <Text ml={2}>Back to Analysis</Text>
        </Button>
      </Link>
      <Flex
        justify="space-between"
        align="center"
        mb={8}
        flexWrap="wrap"
        gap={4}
      >
        <HStack gap={3}>
          <FaCodeBranch size={28} color="#58a6ff" />
          <VStack align="start" gap={0}>
            <Text fontSize="2xl" fontWeight="bold" color="#c9d1d9">
              Pull Request Analytics
            </Text>
            <Text fontSize="sm" color="#8b949e">
              {owner}/{repo}
            </Text>
            <Text fontSize="xs" color="#6e7681">
              Based on most recent {stats.total} PRs (max 200)
            </Text>
          </VStack>
        </HStack>
        <ChakraLink
          href={`https://github.com/${owner}/${repo}/pulls`}
          target="_blank"
          color="#58a6ff"
          fontSize="sm"
          display="flex"
          alignItems="center"
          gap={2}
        >
          View on GitHub <FaExternalLinkAlt size={12} />
        </ChakraLink>
      </Flex>

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
          icon={<FaCodeBranch size={18} />}
          label="PRs Analyzed"
          value={stats.total}
          subtext={`${stats.open} open, ${stats.merged} merged (recent sample)`}
        />
        <StatCard
          icon={<FaClock size={18} />}
          label="Avg Merge Time"
          value={formatHours(stats.avgMergeTimeHours)}
          subtext={`Median: ${formatHours(stats.medianMergeTimeHours)}`}
        />
        <StatCard
          icon={<FaComments size={18} />}
          label="Avg Comments/PR"
          value={stats.conversationStats.avgComments.toFixed(2)}
          subtext={`${stats.conversationStats.totalComments} total comments`}
        />
        <StatCard
          icon={<FaRobot size={18} />}
          label="AI Reviews (Community)"
          value={stats.aiInteractionStats?.totalAIComments || 0}
          subtext={
            stats.aiInteractionStats?.prsWithAIReviews
              ? `${stats.aiInteractionStats.prsWithAIReviews} PRs reviewed by bots`
              : "No AI reviews on community PRs"
          }
        />
      </Grid>

      <Grid
        templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
        gap={6}
        mb={8}
      >
        <ChartCard title="PR Status Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <ChartLegend items={statusData} />
        </ChartCard>
        <ChartCard title="Who Creates PRs?">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={authorData}
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {authorData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <ChartLegend items={authorData} />
        </ChartCard>
      </Grid>

      {/* Time to Merge */}
      <ChartCard title="Time to Merge">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
          {/* Left: Bar Chart + What this means */}
          <GridItem>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={mergeTimeData} layout="vertical">
                <XAxis
                  type="number"
                  stroke="#6e7681"
                  fontSize={11}
                  tickFormatter={(v) =>
                    v < 24 ? `${v}h` : `${Math.round(v / 24)}d`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#6e7681"
                  fontSize={11}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    background: "#161b22",
                    border: "1px solid #30363d",
                  }}
                  formatter={(value) => {
                    if (value === undefined) return ["N/A"];
                    const hours = Number(value);
                    return hours < 24
                      ? [`${Math.round(hours)}h`, "Time"]
                      : [`${Math.round(hours / 24)} days`, "Time"];
                  }}
                />
                <Bar dataKey="hours" fill="#58a6ff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* What this means - below bar chart */}
            <Box mt={3} pt={3} borderTop="1px solid #30363d">
              <Text color="#6e7681" fontSize="xs" mb={2}>
                <Text as="span" fontWeight="bold" color="#a371f7">
                  💡 What this means:
                </Text>
              </Text>
              <Text color="#6e7681" fontSize="xs" lineHeight="1.5">
                <Text as="span" fontWeight="bold" color="#c9d1d9">
                  Median
                </Text>{" "}
                = typical wait. If much lower than average, some PRs drag things
                down.
              </Text>
            </Box>
          </GridItem>

          {/* Right: Line Chart + Summary */}
          <GridItem>
            {stats.mergeTimeChart ? (
              <MergeTimeChart
                chart={stats.mergeTimeChart}
                mergedCount={stats.merged}
              />
            ) : (
              <VStack justify="center" h="150px" bg="#0d1117" borderRadius="md">
                <FaClock color="#6e7681" size={16} />
                <Text color="#6e7681" fontSize="xs">
                  No trend data available
                </Text>
              </VStack>
            )}
          </GridItem>
        </Grid>
      </ChartCard>

      {/* AI Interaction Stats */}
      {stats.aiInteractionStats && (
        <Box mt={6}>
          <AIInteractionCard stats={stats.aiInteractionStats} />
        </Box>
      )}

      {stats.hotPRs.length > 0 && (
        <Box
          bg="#161b22"
          border="1px solid #30363d"
          borderRadius="lg"
          p={5}
          mt={6}
        >
          <HStack gap={2} mb={4}>
            <FaFire color="#f85149" />
            <Text color="#c9d1d9" fontWeight="bold">
              Most Active PRs
            </Text>
          </HStack>
          <VStack align="stretch" gap={2}>
            {stats.hotPRs.map((pr) => (
              <ChakraLink
                key={pr.id}
                href={pr.url}
                target="_blank"
                _hover={{ textDecoration: "none" }}
              >
                <Flex
                  justify="space-between"
                  align="center"
                  p={3}
                  bg="#0d1117"
                  borderRadius="md"
                  transition="all 0.2s"
                  _hover={{ bg: "#21262d" }}
                >
                  <HStack flex={1} minW={0}>
                    <Text color="#58a6ff" fontWeight="medium" flexShrink={0}>
                      #{pr.id}
                    </Text>
                    <Text color="#c9d1d9" fontSize="sm" lineClamp={1}>
                      {pr.title}
                    </Text>
                  </HStack>
                  <HStack gap={2} flexShrink={0} ml={2}>
                    <Badge bg="#30363d" color="#8b949e">
                      {pr.comments + pr.reviewComments} 💬
                    </Badge>
                    <Text color="#6e7681" fontSize="xs">
                      by {pr.author}
                    </Text>
                  </HStack>
                </Flex>
              </ChakraLink>
            ))}
          </VStack>
        </Box>
      )}

      {/* Contributor Journey Sankey */}
      {stats.contributorFunnel && (
        <Box mt={6}>
          <ContributorSankey funnel={stats.contributorFunnel} />
        </Box>
      )}

      {stats.hasTemplate && stats.templatePath && (
        <Box
          bg="#161b22"
          border="1px solid #30363d"
          borderRadius="lg"
          p={5}
          mt={6}
        >
          <HStack gap={3}>
            <FaFileAlt color="#238636" size={18} />
            <Text color="#c9d1d9">This repo has a PR template:</Text>
            <ChakraLink
              href={`https://github.com/${owner}/${repo}/blob/main/${stats.templatePath}`}
              target="_blank"
              color="#58a6ff"
              _hover={{ textDecoration: "underline" }}
            >
              {stats.templatePath} →
            </ChakraLink>
          </HStack>
        </Box>
      )}
    </Box>
  );
}
