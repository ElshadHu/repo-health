"use client";

import { Box, Text, HStack, VStack, Flex } from "@chakra-ui/react";
import { FaExclamationTriangle, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

type CategoryCount = {
  category: string;
  count: number;
};

type Props = {
  analyzedCount: number;
  topCategories: CategoryCount[];
  topPattern: string | null;
  owner: string;
  repo: string;
};

export function PitfallsSummaryCard({
  analyzedCount,
  topCategories,
  topPattern,
  owner,
  repo,
}: Props) {
  const hasData = analyzedCount > 0;

  return (
    <Link
      href={`/pitfalls/${owner}/${repo}`}
      style={{ textDecoration: "none" }}
    >
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
          borderColor: hasData ? "#f0883e" : "#238636",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
        role="group"
      >
        {/* Header */}
        <Flex justify="space-between" align="center" mb={4}>
          <HStack gap={3}>
            <Box
              bg={
                hasData ? "rgba(240, 136, 62, 0.15)" : "rgba(35, 134, 54, 0.15)"
              }
              p={2}
              borderRadius="md"
            >
              <FaExclamationTriangle
                color={hasData ? "#f0883e" : "#238636"}
                size={20}
              />
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize="lg" fontWeight="bold" color="#c9d1d9">
                Contribution Insights
              </Text>
              <Text fontSize="sm" color="#8b949e">
                {analyzedCount} patterns analyzed
              </Text>
            </VStack>
          </HStack>
          <Box
            color="#8b949e"
            transition="all 0.2s ease"
            _groupHover={{
              transform: "translateX(4px)",
              color: "#c9d1d9",
            }}
          >
            <FaArrowRight />
          </Box>
        </Flex>

        {hasData ? (
          <>
            {/* Category Badges */}
            <HStack gap={2} flexWrap="wrap" mb={3}>
              {topCategories.slice(0, 3).map(({ category, count }) => (
                <Box
                  key={category}
                  bg="rgba(248, 81, 73, 0.2)"
                  color="#f85149"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="600"
                >
                  {count} {category}
                </Box>
              ))}
            </HStack>

            {/* Top Pattern */}
            {topPattern && (
              <Text
                fontSize="sm"
                color="#f0883e"
                fontWeight="500"
                lineHeight="1.4"
                overflow="hidden"
                textOverflow="ellipsis"
                css={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                💡 {topPattern}
              </Text>
            )}
          </>
        ) : (
          <HStack gap={2}>
            <Box w="8px" h="8px" borderRadius="full" bg="#238636" />
            <Text fontSize="sm" color="#238636" fontWeight="medium">
              No rejected community PRs found
            </Text>
          </HStack>
        )}

        {/* Footer */}
        <Text
          fontSize="xs"
          color="#6e7681"
          mt="auto"
          pt={3}
          _groupHover={{ color: "#8b949e" }}
        >
          {hasData
            ? "Learn what to avoid before contributing →"
            : "This repo welcomes new contributors! →"}
        </Text>
      </Box>
    </Link>
  );
}
