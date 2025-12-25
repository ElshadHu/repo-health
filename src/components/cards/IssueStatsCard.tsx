"use client";

import { Box, Text, HStack, VStack, Flex } from "@chakra-ui/react";
import { FaBug, FaArrowRight, FaHandsHelping } from "react-icons/fa";
import Link from "next/link";

type Props = {
  openIssues: number;
  owner: string;
  repo: string;
};

export function IssueStatsCard({ openIssues, owner, repo }: Props) {
  return (
    <Link href={`/issues/${owner}/${repo}`} style={{ textDecoration: "none" }}>
      <Box
        bg="#161b22"
        border="1px solid #30363d"
        borderRadius="lg"
        p={6}
        minH="200px"
        h="200px"
        cursor="pointer"
        transition="all 0.3s ease"
        _hover={{
          borderColor: "#238636",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
        role="group"
      >
        <Flex justify="space-between" align="center" mb={4}>
          <HStack gap={3}>
            <Box bg="rgba(35,134,54,0.15)" p={2} borderRadius="md">
              <FaBug color="#238636" size={20} />
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize="lg" fontWeight="bold" color="#c9d1d9">
                Issues
              </Text>
              <Text fontSize="sm" color="#8b949e">
                {openIssues} open
              </Text>
            </VStack>
          </HStack>
          <Box
            color="#8b949e"
            transition="all 0.2s ease"
            _groupHover={{ transform: "translateX(4px)", color: "#c9d1d9" }}
          >
            <FaArrowRight />
          </Box>
        </Flex>

        <HStack gap={2} color="#6e7681" fontSize="xs">
          <FaHandsHelping size={12} />
          <Text>View issue analysis →</Text>
        </HStack>

        <Text
          fontSize="xs"
          color="#6e7681"
          mt={3}
          _groupHover={{ color: "#8b949e" }}
        >
          Crackability scores, hot issues, and more
        </Text>
      </Box>
    </Link>
  );
}
