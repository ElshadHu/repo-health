"use client";
import { Box, SimpleGrid, VStack, Text } from "@chakra-ui/react";
import { FaCheck, FaTimes } from "react-icons/fa";
import type { SetupInsights } from "@/server/types/setup";

export function DosDonts({ data }: { data: SetupInsights["dosDonts"] }) {
  return (
    <SimpleGrid columns={2} gap={4}>
      <Box
        bg="#161b22"
        border="1px solid #30363d"
        borderTop="3px solid #3fb950"
        borderRadius="lg"
        p={5}
      >
        <Text color="#3fb950" fontWeight="600" mb={4}>
          <FaCheck style={{ display: "inline" }} /> Do
        </Text>
        <VStack align="stretch" gap={3}>
          {data.dos.map((item, i) => (
            <Box key={i} bg="#21262d" borderRadius="md" p={3}>
              <Text color="#f0f6fc" fontSize="14px" fontWeight="500">
                {item.text}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>
      <Box
        bg="#161b22"
        border="1px solid #30363d"
        borderTop="3px solid #f85149"
        borderRadius="lg"
        p={5}
      >
        <Text color="#f85149" fontWeight="600" mb={4}>
          <FaTimes style={{ display: "inline" }} /> Don&apos;t
        </Text>
        <VStack align="stretch" gap={3}>
          {data.donts.map((item, i) => (
            <Box key={i} bg="#21262d" borderRadius="md" p={3}>
              <Text color="#f0f6fc" fontSize="14px" fontWeight="500">
                {item.text}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </SimpleGrid>
  );
}
