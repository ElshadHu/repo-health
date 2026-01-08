"use client";
import { Box, HStack, VStack, Text } from "@chakra-ui/react";
import type { SetupTimeEstimate } from "@/server/types/setup";
const colors = {
  install: "#58a6ff",
  configuration: "#a371f7",
  troubleshooting: "#79c0ff",
  platformSpecific: "#8b949e",
};

export function TimeBreakDown({ data }: { data: SetupTimeEstimate }) {
  const { breakdown, totalMinutes } = data;
  const total =
    breakdown.install +
    breakdown.configuration +
    breakdown.troubleshooting +
    breakdown.platformSpecific;
  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
      <HStack justify="space-between" mb={4}>
        <Text color="#f0f6fc" fontWeight="600">
          Time Breakdown
        </Text>
        <Text color="#f0883e" fontWeight="bold" fontSize="xl">
          ~{totalMinutes} min
        </Text>
      </HStack>
      <HStack h="20px" borderRadius="md" overflow="hidden" mb={4}>
        {Object.entries(breakdown).map(([key, val]) => (
          <Box
            key={key}
            flex={val / total}
            bg={colors[key as keyof typeof colors]}
            h="100%"
          />
        ))}
      </HStack>
      <VStack align="stretch" gap={2}>
        {Object.entries(breakdown).map(([key, val]) => (
          <HStack key={key} justify="space-between">
            <HStack gap={2}>
              <Box
                w="10px"
                h="10px"
                borderRadius="sm"
                bg={colors[key as keyof typeof colors]}
              />
              <Text color="#8b949e" fontSize="13px">
                {key.replace(/([A-Z])/g, " $1")}
              </Text>
            </HStack>
            <Text color="#f0f6fc" fontWeight="500">
              {val} min
            </Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
