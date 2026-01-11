"use client";

import { Box, Text, HStack, Flex } from "@chakra-ui/react";
import { FaChartLine, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

type Props = { owner: string; repo: string };

export function ActivityCard({ owner, repo }: Props) {
  return (
    <Link href={`/activity/${owner}/${repo}`}>
      <Box
        bg="#161b22"
        border="1px solid #30363d"
        borderRadius="lg"
        p={5}
        minH="200px"
        h="200px"
        cursor="pointer"
        transition="all 0.3s ease"
        _hover={{
          borderColor: "#58a6ff",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
        role="group"
      >
        <Flex justify="space-between" align="flex-start">
          <HStack gap={2} mb={2}>
            <FaChartLine color="#58a6ff" />
            <Text color="#c9d1d9" fontWeight="bold">
              Activity Monitor
            </Text>
          </HStack>
          <Box
            color="#8b949e"
            transition="all 0.2s ease"
            _groupHover={{ transform: "translateX(4px)", color: "#c9d1d9" }}
          >
            <FaArrowRight />
          </Box>
        </Flex>
        <Text color="#8b949e" fontSize="sm">
          Anomaly detection for commits
        </Text>
      </Box>
    </Link>
  );
}
