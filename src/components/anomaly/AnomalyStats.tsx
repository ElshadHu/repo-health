"use client";

import { Grid, Box, Text } from "@chakra-ui/react";

type Props = {
  summary: { critical: number; warning: number; info: number };
  commitsAnalyzed: number;
};

export function AnomalyStats({ summary, commitsAnalyzed }: Props) {
  const stats = [
    { label: "Critical", value: summary.critical, color: "#f85149" },
    { label: "Warnings", value: summary.warning, color: "#d29922" },
    { label: "Info", value: summary.info, color: "#58a6ff" },
    { label: "Commits", value: commitsAnalyzed, color: "#c9d1d9" },
  ];

  return (
    <Grid
      templateColumns={{ base: "1fr 1fr", lg: "repeat(4, 1fr)" }}
      gap={4}
      mb={8}
    >
      {stats.map((s) => (
        <Box
          key={s.label}
          bg="#161b22"
          border="1px solid #30363d"
          borderRadius="lg"
          p={5}
        >
          <Text color="#8b949e" fontSize="sm">
            {s.label}
          </Text>
          <Text color={s.color} fontSize="2xl" fontWeight="bold">
            {s.value}
          </Text>
        </Box>
      ))}
    </Grid>
  );
}
