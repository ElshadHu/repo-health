"use client";

import { Box, Text, HStack, VStack, Flex } from "@chakra-ui/react";
import { FaShieldAlt, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

type Props = {
  owner: string;
  repo: string;
};

export function SecurityCard({ owner, repo }: Props) {
  return (
    <Link
      href={`/security/${owner}/${repo}`}
      style={{ textDecoration: "none" }}
    >
      <Box
        bg="#161b22"
        border="1px solid #30363d"
        borderRadius="lg"
        p={6}
        cursor="pointer"
        transition="all 0.3s ease"
        _hover={{
          borderColor: "#f85149",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
        role="group"
      >
        <Flex justify="space-between" align="center" mb={4}>
          <HStack gap={3}>
            <Box bg="rgba(248,81,73,0.15)" p={2} borderRadius="md">
              <FaShieldAlt color="#f85149" size={20} />
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize="lg" fontWeight="bold" color="#c9d1d9">
                Security Scan
              </Text>
              <Text fontSize="sm" color="#8b949e">
                Detect exposed secrets
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

        <Text fontSize="xs" color="#6e7681" _groupHover={{ color: "#8b949e" }}>
          Scan for API keys, tokens, and credentials
        </Text>
      </Box>
    </Link>
  );
}
