"use client";

import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Flex,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { FaGem } from "react-icons/fa";
import type { HiddenGem } from "@/server/types";

export function HiddenGemsCard({ gems }: { gems: HiddenGem[] }) {
  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
      <HStack gap={2} mb={4}>
        <FaGem color="#a371f7" />
        <Text color="#c9d1d9" fontWeight="bold">
          Hidden Gems
        </Text>
        <Text color="#6e7681" fontSize="sm">
          Overlooked high-impact issues
        </Text>
      </HStack>

      <VStack align="stretch" gap={2}>
        {gems.slice(0, 5).map((gem) => (
          <ChakraLink
            key={gem.number}
            href={gem.url}
            target="_blank"
            _hover={{ textDecoration: "none" }}
          >
            <Flex
              justify="space-between"
              align="center"
              p={3}
              bg="#0d1117"
              borderRadius="md"
              _hover={{ bg: "#21262d" }}
            >
              <HStack flex={1} minW={0}>
                <Text color="#a371f7" fontWeight="medium" flexShrink={0}>
                  #{gem.number}
                </Text>
                <Text color="#c9d1d9" fontSize="sm" lineClamp={1}>
                  {gem.title}
                </Text>
              </HStack>
              <HStack gap={2} flexShrink={0} ml={2}>
                <Badge bg="#30363d" color="#8b949e" fontSize="xs">
                  {gem.staleDays}d stale
                </Badge>
                <Badge bg="#a371f726" color="#a371f7" fontSize="xs">
                  {gem.reason.split(";")[0]}
                </Badge>
              </HStack>
            </Flex>
          </ChakraLink>
        ))}
      </VStack>
    </Box>
  );
}
