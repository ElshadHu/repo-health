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
import { FaFire, FaShieldAlt } from "react-icons/fa";
import type { HotIssue } from "@/server/types";

export function HotIssuesCard({ issues }: { issues: HotIssue[] }) {
  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
      <HStack gap={2} mb={4}>
        <FaFire color="#f85149" />
        <Text color="#c9d1d9" fontWeight="bold">
          Hot Issues
        </Text>
        <Text color="#6e7681" fontSize="sm">
          Recently active
        </Text>
      </HStack>

      <VStack align="stretch" gap={2}>
        {issues.slice(0, 5).map((issue) => (
          <ChakraLink
            key={issue.number}
            href={issue.url}
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
                <Text color="#58a6ff" fontWeight="medium" flexShrink={0}>
                  #{issue.number}
                </Text>
                <Text color="#c9d1d9" fontSize="sm" lineClamp={1}>
                  {issue.title}
                </Text>
              </HStack>
              <HStack gap={2} flexShrink={0} ml={2}>
                {issue.hasSecurityKeyword && (
                  <Badge bg="#f8514926" color="#f85149" fontSize="xs">
                    <HStack gap={1}>
                      <FaShieldAlt size={10} />
                      <Text>Security</Text>
                    </HStack>
                  </Badge>
                )}
                <Badge bg="#30363d" color="#8b949e">
                  {issue.recentComments} 💬
                </Badge>
              </HStack>
            </Flex>
          </ChakraLink>
        ))}
      </VStack>
    </Box>
  );
}
