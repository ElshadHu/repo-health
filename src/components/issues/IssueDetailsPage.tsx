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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  FaBug,
  FaClock,
  FaHandsHelping,
  FaHeart,
  FaExternalLinkAlt,
} from "react-icons/fa";
import type { IssueStats } from "@/server/types";
import { HotIssuesCard } from "./HotIssuesCard";
import { HiddenGemsCard } from "./HiddenGemsCard";

const COLORS = {
  open: "#238636",
  closed: "#8b949e",
  easy: "#238636",
  medium: "#d29922",
  hard: "#f85149",
  expert: "#a371f7",
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

export function IssueDetailsPage({
  stats,
  owner,
  repo,
}: {
  stats: IssueStats;
  owner: string;
  repo: string;
}) {
  const statusData = [
    { name: "Open", value: stats.open, color: COLORS.open },
    { name: "Closed", value: stats.closed, color: COLORS.closed },
  ];

  const crackabilityData = Object.values(stats.crackabilityScores).reduce(
    (acc, score) => {
      acc[score.difficulty]++;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0, expert: 0 } as Record<string, number>
  );

  const difficultyChartData = [
    { name: "Easy", value: crackabilityData.easy, color: COLORS.easy },
    { name: "Medium", value: crackabilityData.medium, color: COLORS.medium },
    { name: "Hard", value: crackabilityData.hard, color: COLORS.hard },
    { name: "Expert", value: crackabilityData.expert, color: COLORS.expert },
  ].filter((d) => d.value > 0);

  const formatHours = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    if (hours < 168) return `${Math.round(hours / 24)}d`;
    return `${Math.round(hours / 168)}w`;
  };

  return (
    <Box maxW="1200px" mx="auto" p={{ base: 4, md: 8 }}>
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        mb={8}
        flexWrap="wrap"
        gap={4}
      >
        <HStack gap={3}>
          <FaBug size={28} color="#58a6ff" />
          <VStack align="start" gap={0}>
            <Text fontSize="2xl" fontWeight="bold" color="#c9d1d9">
              Issue Analytics
            </Text>
            <Text fontSize="sm" color="#8b949e">
              {owner}/{repo}
            </Text>
          </VStack>
        </HStack>
        <ChakraLink
          href={`https://github.com/${owner}/${repo}/issues`}
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
          icon={<FaBug size={18} />}
          label="Total Issues"
          value={stats.total}
          subtext={`${stats.open} open, ${stats.closed} closed`}
        />
        <StatCard
          icon={<FaClock size={18} />}
          label="Avg Close Time"
          value={formatHours(stats.avgCloseTimeHours)}
          subtext={`Median: ${formatHours(stats.medianCloseTimeHours)}`}
        />
        <StatCard
          icon={<FaHandsHelping size={18} />}
          label="Good First Issues"
          value={stats.goodFirstIssues}
          subtext={`${stats.helpWantedIssues} help wanted`}
        />
        <StatCard
          icon={<FaHeart size={18} />}
          label="Hidden Gems"
          value={stats.hiddenGems.length}
          subtext="Overlooked high-impact issues"
        />
      </Grid>

      {/* Charts */}
      <Grid
        templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
        gap={6}
        mb={8}
      >
        <ChartCard title="Issue Status">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#161b22",
                  border: "1px solid #30363d",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <HStack justify="center" gap={4} mt={2}>
            {statusData.map((item) => (
              <HStack key={item.name} gap={1}>
                <Box w="10px" h="10px" borderRadius="full" bg={item.color} />
                <Text color="#8b949e" fontSize="xs">
                  {item.name}: {item.value}
                </Text>
              </HStack>
            ))}
          </HStack>
        </ChartCard>

        <ChartCard title="Difficulty Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={difficultyChartData}
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {difficultyChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#161b22",
                  border: "1px solid #30363d",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <HStack justify="center" gap={4} mt={2} flexWrap="wrap">
            {difficultyChartData.map((item) => (
              <HStack key={item.name} gap={1}>
                <Box w="10px" h="10px" borderRadius="full" bg={item.color} />
                <Text color="#8b949e" fontSize="xs">
                  {item.name}: {item.value}
                </Text>
              </HStack>
            ))}
          </HStack>
        </ChartCard>
      </Grid>

      {/* Hot Issues */}
      {stats.hotIssues.length > 0 && (
        <Box mt={6}>
          <HotIssuesCard issues={stats.hotIssues} />
        </Box>
      )}

      {/* Hidden Gems */}
      {stats.hiddenGems.length > 0 && (
        <Box mt={6}>
          <HiddenGemsCard gems={stats.hiddenGems} />
        </Box>
      )}
    </Box>
  );
}
