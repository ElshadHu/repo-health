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
        minH="180px"
        cursor="pointer"
        _hover={{ borderColor: "#58a6ff", transform: "translateY(-2px)" }}
        transition="all 0.2s"
      >
        <Flex justify="space-between" align="flex-start">
          <HStack gap={2} mb={2}>
            <FaChartLine color="#58a6ff" />
            <Text color="#c9d1d9" fontWeight="bold">
              Activity Monitor
            </Text>
          </HStack>
          <FaArrowRight color="#8b949e" />
        </Flex>
        <Text color="#8b949e" fontSize="sm">
          Anomaly detection for commits
        </Text>
      </Box>
    </Link>
  );
}
