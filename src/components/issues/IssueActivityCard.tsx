"use client";

import { Box, Text, HStack, Grid, Flex } from "@chakra-ui/react";
import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import type { MaintainerHeatmap as HeatmapType } from "@/server/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getColor(count: number, maxCount: number): string {
  if (count === 0) return "#161b22";
  const intensity = count / maxCount;
  if (intensity < 0.25) return "#0e4429";
  if (intensity < 0.5) return "#006d32";
  if (intensity < 0.75) return "#26a641";
  return "#39d353";
}

type Props = {
  heatmap: HeatmapType;
  labelBreakdown: Record<string, number>;
};

export function IssueActivityCard({ heatmap, labelBreakdown }: Props) {
  const maxCount = Math.max(...heatmap.activityCells.map((c) => c.count), 1);

  const formatHour = (hour: number) => {
    if (hour === 0) return "12a";
    if (hour < 12) return `${hour}a`;
    if (hour === 12) return "12p";
    return `${hour - 12}p`;
  };

  const labelData = Object.entries(labelBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name: name.slice(0, 12), value }));

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
      <Text color="#c9d1d9" fontWeight="bold" mb={4}>
        Issue Activity
      </Text>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        {/* Left: Labels */}
        <Box>
          <Text color="#8b949e" fontSize="xs" mb={3}>
            Top Labels
          </Text>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={labelData}
              layout="vertical"
              margin={{ left: 0, right: 0 }}
            >
              <XAxis type="number" hide />
              <Bar
                dataKey="value"
                fill="#58a6ff"
                radius={[0, 4, 4, 0]}
                label={{
                  position: "insideLeft",
                  fill: "#c9d1d9",
                  fontSize: 10,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
          <HStack justify="space-between" mt={2} flexWrap="wrap" gap={1}>
            {labelData.slice(0, 3).map((l) => (
              <Text key={l.name} color="#6e7681" fontSize="9px">
                {l.name}
              </Text>
            ))}
          </HStack>
        </Box>

        {/* Right: Heatmap + Stats */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text color="#8b949e" fontSize="xs">
              When Created
            </Text>
            <HStack gap={4}>
              <Box>
                <Text color="#6e7681" fontSize="9px">
                  Response
                </Text>
                <Text color="#c9d1d9" fontSize="sm" fontWeight="bold">
                  {heatmap.avgResponseTimeHours}h
                </Text>
              </Box>
              <Box>
                <Text color="#6e7681" fontSize="9px">
                  Ghost Rate
                </Text>
                <Text color="#c9d1d9" fontSize="sm" fontWeight="bold">
                  {heatmap.ghostingRate}%
                </Text>
              </Box>
            </HStack>
          </Flex>

          {/* Compact Heatmap */}
          <Box overflowX="auto">
            <Grid
              templateColumns="24px repeat(24, 1fr)"
              gap="1px"
              fontSize="8px"
            >
              <Box />
              {[0, 6, 12, 18].map((h) => (
                <Text
                  key={h}
                  color="#6e7681"
                  gridColumn={`span 6`}
                  textAlign="center"
                >
                  {formatHour(h)}
                </Text>
              ))}

              {DAYS.map((day, dayIndex) => (
                <Box key={`row-${dayIndex}`} display="contents">
                  <Text color="#8b949e" fontSize="8px" alignSelf="center">
                    {day.slice(0, 2)}
                  </Text>
                  {Array.from({ length: 24 }, (_, hourIndex) => {
                    const cell = heatmap.activityCells.find(
                      (c) => c.day === dayIndex && c.hour === hourIndex
                    );
                    return (
                      <Box
                        key={`${dayIndex}-${hourIndex}`}
                        bg={getColor(cell?.count || 0, maxCount)}
                        borderRadius="1px"
                        h="10px"
                        title={`${cell?.count || 0} on ${day} ${formatHour(hourIndex)}`}
                      />
                    );
                  })}
                </Box>
              ))}
            </Grid>
          </Box>

          {/* Legend */}
          <HStack justify="flex-end" gap={1} mt={2}>
            <Text color="#6e7681" fontSize="8px">
              Less
            </Text>
            {["#161b22", "#0e4429", "#26a641", "#39d353"].map((c) => (
              <Box key={c} w="8px" h="8px" bg={c} borderRadius="1px" />
            ))}
            <Text color="#6e7681" fontSize="8px">
              More
            </Text>
          </HStack>
        </Box>
      </Grid>
    </Box>
  );
}
