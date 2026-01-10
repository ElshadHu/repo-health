"use client";
import { Box, SimpleGrid, VStack, Text, HStack } from "@chakra-ui/react";
import { FaCheck, FaTimes } from "react-icons/fa";
import type { SetupInsights } from "@/server/types/setup";

export function DosDonts({ data }: { data: SetupInsights["dosDonts"] }) {
  return (
    <SimpleGrid columns={2} gap={3}>
      <Box
        bg="#161b22"
        border="1px solid #30363d"
        borderTop="2px solid #3fb950"
        borderRadius="lg"
        p={4}
      >
        <HStack gap={1} mb={3}>
          <FaCheck color="#3fb950" size={12} />
          <Text color="#3fb950" fontWeight="600" fontSize="md">
            Do
          </Text>
        </HStack>
        <VStack align="stretch" gap={2}>
          {data.dos.map((item, i) => (
            <Box key={i} bg="#21262d" borderRadius="md" p={2}>
              <Text color="#f0f6fc" fontSize="sm" fontWeight="500">
                {item.text}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>
      <Box
        bg="#161b22"
        border="1px solid #30363d"
        borderTop="2px solid #f85149"
        borderRadius="lg"
        p={4}
      >
        <HStack gap={1} mb={3}>
          <FaTimes color="#f85149" size={12} />
          <Text color="#f85149" fontWeight="600" fontSize="md">
            Don&apos;t
          </Text>
        </HStack>
        <VStack align="stretch" gap={2}>
          {data.donts.map((item, i) => (
            <Box key={i} bg="#21262d" borderRadius="md" p={2}>
              <Text color="#f0f6fc" fontSize="sm" fontWeight="500">
                {item.text}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </SimpleGrid>
  );
}
