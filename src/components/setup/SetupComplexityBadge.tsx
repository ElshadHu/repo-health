"use client";
import { Box, Text, HStack, VStack } from "@chakra-ui/react";

type Complexity = "Easy" | "Moderate" | "Advanced";

interface SetupComplexityBadgeProps {
  issueCount: number;
  envVarCount: number;
}

export function SetupComplexityBadge({
  issueCount,
  envVarCount,
}: SetupComplexityBadgeProps) {
  // Calculate complexity based on issues and env vars
  const getComplexity = (): Complexity => {
    const score = issueCount * 2 + envVarCount;
    if (score <= 3) return "Easy";
    if (score <= 7) return "Moderate";
    return "Advanced";
  };

  const complexity = getComplexity();

  const colors = {
    Easy: { bg: "#3fb950", text: "#3fb950", badgeBg: "#3fb95033" },
    Moderate: { bg: "#f0883e", text: "#f0883e", badgeBg: "#f0883e33" },
    Advanced: { bg: "#f85149", text: "#f85149", badgeBg: "#f8514933" },
  };

  const c = colors[complexity];

  return (
    <VStack gap={1} align="center">
      <Text color="#8b949e" fontSize="sm" textAlign="center">
        Complexity
      </Text>
      <HStack gap={2}>
        <Box w="10px" h="10px" bg={c.bg} borderRadius="full" />
        <Text color={c.text} fontSize="md" fontWeight="bold">
          {complexity}
        </Text>
      </HStack>
    </VStack>
  );
}
