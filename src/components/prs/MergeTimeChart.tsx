"use client";
import { Box, Text, HStack, VStack } from "@chakra-ui/react";
import { ResponsiveLine } from "@nivo/line";
import { FaArrowUp, FaArrowDown, FaMinus, FaChartLine } from "react-icons/fa";
import type { PRMergeTimeChart } from "@/server/types";

type Props = {
  chart: PRMergeTimeChart;
  mergedCount: number;
};

export function MergeTimeChart({ chart, mergedCount }: Props) {
  const { monthly, trend, comparison } = chart;

  // Format month: "2026-01" -> "Jan" (avoiding timezone issues)
  const formatMonth = (m: string) => {
    const [year, month] = m.split("-").map(Number);
    return new Date(year, month - 1, 15).toLocaleDateString("en", {
      month: "short",
    });
  };

  // Calculate max hours
  const maxHours = Math.max(...monthly.map((m) => m.avgDays * 24), 1);

  // tick values based on max
  const tickValues =
    maxHours <= 3
      ? [0, 1, 2, 3]
      : maxHours <= 12
        ? [0, 3, 6, 12]
        : maxHours <= 24
          ? [0, 6, 12, 24]
          : maxHours <= 72
            ? [0, 24, 48, 72]
            : [0, 24, 72, 168];

  // Format hours to readable label
  const formatLabel = (hours: number): string => {
    if (hours === 0) return "0";
    if (hours < 24) return `${hours}h`;
    return `${Math.round(hours / 24)}d`;
  };

  // Trend indicator
  const TrendIcon =
    trend.direction === "up"
      ? FaArrowUp
      : trend.direction === "down"
        ? FaArrowDown
        : FaMinus;

  const trendColor =
    trend.direction === "up"
      ? "#3fb950"
      : trend.direction === "down"
        ? "#f85149"
        : "#8b949e";

  const hasTrend = trend.direction !== "flat" && trend.change > 0;

  // Line chart data with additional metadata
  const lineData = [
    {
      id: "Merge Time",
      data: monthly.map((m) => ({
        x: formatMonth(m.month),
        y: m.avgDays * 24,
        count: m.count, // Store count for tooltip
        hours: m.avgDays * 24,
      })),
    },
  ];

  // Custom tooltip component
  const CustomTooltip = ({
    point,
  }: {
    point: { data: { hours: number; count: number; x: string } };
  }) => {
    const hours = point.data.hours;
    const count = point.data.count;
    const month = point.data.x;

    const formatTime = (hrs: number): string => {
      if (hrs < 1) {
        return `${Math.round(hrs * 60)} minutes`;
      } else if (hrs < 24) {
        return `${hrs.toFixed(1)} hours`;
      }
      const days = hrs / 24;
      return `${days.toFixed(1)} days`;
    };

    return (
      <Box
        bg="#161b22"
        border="2px solid #58a6ff"
        borderRadius="md"
        p={3}
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)"
        minW="200px"
        maxW="240px"
      >
        <Text color="#8b949e" fontSize="xs" fontWeight="600" mb={2}>
          {month}
        </Text>
        <VStack align="start" gap={1}>
          <HStack>
            <Text color="#6e7681" fontSize="xs">
              Avg. Merge Time:
            </Text>
            <Text color="#c9d1d9" fontSize="sm" fontWeight="bold">
              {formatTime(hours)}
            </Text>
          </HStack>
          <Text color="#6e7681" fontSize="xs">
            {count} PR{count !== 1 ? "s" : ""} merged
          </Text>
        </VStack>
      </Box>
    );
  };

  return (
    <Box>
      {/* Line Chart */}
      {monthly.length > 1 ? (
        <Box height="150px" position="relative" overflow="visible">
          <ResponsiveLine
            data={lineData}
            margin={{ top: 10, right: 60, bottom: 25, left: 45 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: maxHours * 1.2 }}
            curve="monotoneX"
            colors={["#58a6ff"]}
            lineWidth={2}
            pointSize={8}
            pointColor="#161b22"
            pointBorderWidth={2}
            pointBorderColor="#58a6ff"
            enableArea
            areaOpacity={0.15}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
              tickValues,
              format: (v) => formatLabel(Number(v)),
            }}
            axisBottom={{ tickSize: 0, tickPadding: 5 }}
            theme={{
              text: { fill: "#8b949e", fontSize: 11 },
              axis: { ticks: { text: { fill: "#8b949e" } } },
              grid: { line: { stroke: "#30363d" } },
              crosshair: {
                line: {
                  stroke: "#ffffff",
                  strokeWidth: 1,
                  strokeDasharray: "6 6",
                },
              },
              tooltip: {
                container: {
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                },
              },
            }}
            enableGridX={false}
            enableGridY
            gridYValues={tickValues}
            tooltip={CustomTooltip}
            useMesh={true}
            motionConfig="instant"
            animate={true}
          />
        </Box>
      ) : (
        <VStack justify="center" h="120px" bg="#0d1117" borderRadius="md">
          <FaChartLine color="#6e7681" size={16} />
          <Text color="#6e7681" fontSize="xs">
            Need 2+ months for trend
          </Text>
        </VStack>
      )}

      {/* Summary with trend and community comparison */}
      <VStack mt={3} align="start" gap={1} pl={10}>
        <HStack flexWrap="wrap" gap={3}>
          <Text color="#6e7681" fontSize="sm">
            Calculated from {mergedCount} merged PRs.
          </Text>

          {hasTrend && (
            <HStack gap={1}>
              <TrendIcon color={trendColor} size={12} />
              <Text color={trendColor} fontSize="sm" fontWeight="600">
                {trend.direction === "up" ? "Improved" : "Slowed"}{" "}
                {trend.change}%
              </Text>
            </HStack>
          )}
        </HStack>

        {/* Community vs Maintainer comparison */}
        {Math.abs(comparison.diffPercent) > 10 && (
          <Text color="#6e7681" fontSize="sm">
            Community PRs{" "}
            <Text
              as="span"
              color={comparison.diffPercent > 0 ? "#f0883e" : "#3fb950"}
              fontWeight="600"
            >
              {comparison.diffPercent > 0 ? "wait longer" : "merge faster"} (
              {Math.abs(comparison.diffPercent)}%)
            </Text>
          </Text>
        )}
      </VStack>
    </Box>
  );
}
