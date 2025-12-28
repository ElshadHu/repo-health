"use client";

import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import { FaLightbulb, FaExclamationTriangle } from "react-icons/fa";

type Props = {
  patterns: string[];
};

export function QuickTipsCard({ patterns }: Props) {
  if (patterns.length === 0) {
    return null;
  }

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
      <HStack gap={2} mb={4}>
        <FaLightbulb color="#f0883e" size={18} />
        <Text color="#c9d1d9" fontWeight="bold">
          Quick Tips Before Contributing
        </Text>
      </HStack>

      <VStack align="stretch" gap={3}>
        {patterns.map((pattern, index) => (
          <HStack
            key={index}
            align="flex-start"
            gap={3}
            py={3}
            borderBottom={
              index < patterns.length - 1 ? "1px solid #21262d" : "none"
            }
          >
            <Text color="#f0883e" fontSize="sm">
              <FaExclamationTriangle />
            </Text>
            <Text color="#c9d1d9" fontSize="sm" lineHeight="1.5">
              {pattern}
            </Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
