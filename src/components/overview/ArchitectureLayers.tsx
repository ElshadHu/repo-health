"use client";

import { Box, Text, VStack, HStack } from "@chakra-ui/react";
import { FaLayerGroup } from "react-icons/fa";

type Props = {
  layers: Record<string, string>;
};

export function ArchitectureLayers({ layers }: Props) {
  const entries = Object.entries(layers);
  if (!entries.length) return null;

  return (
    <Box
      bg="#161b22"
      border="1px solid #30363d"
      borderRadius="lg"
      p={6}
      overflow="hidden"
      minWidth={0}
    >
      <HStack gap={2} mb={4}>
        <FaLayerGroup color="#a371f7" size={18} />
        <Text fontSize="lg" fontWeight="600" color="#c9d1d9">
          Architecture Layers
        </Text>
      </HStack>
      <VStack align="stretch" gap={3}>
        {entries.map(([name, paths]) => (
          <HStack
            key={name}
            borderBottom="1px solid #21262d"
            pb={3}
            flexWrap="wrap"
            gap={2}
          >
            <Text
              color="#c9d1d9"
              minW="100px"
              fontWeight="500"
              textTransform="capitalize"
            >
              {name}
            </Text>
            <Text
              color="#8b949e"
              fontFamily="mono"
              fontSize="sm"
              wordBreak="break-word"
              flex={1}
              minWidth={0}
            >
              {paths}
            </Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
