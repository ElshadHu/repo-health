"use client";

import { Box, Text, HStack, VStack, Flex, Avatar } from "@chakra-ui/react";
import { FaUserSlash, FaExternalLinkAlt } from "react-icons/fa";
import Link from "next/link";

import type { SpammerProfile } from "@/server/types";

type Props = {
  spammers: SpammerProfile[];
  owner: string;
  repo: string;
};

export function SpammerSection({ spammers, owner, repo }: Props) {
  if (!spammers || spammers.length === 0) {
    return null;
  }

  return (
    <Box bg="#161b22" border="1px solid #f85149" borderRadius="lg" p={6} mb={8}>
      {/* Header */}
      <HStack gap={3} mb={5}>
        <FaUserSlash color="#f85149" size={20} />
        <Text fontSize="lg" fontWeight="bold" color="#f85149">
          Don&apos;t Do These
        </Text>
        <Box
          bg="rgba(248, 81, 73, 0.2)"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          color="#f85149"
        >
          {spammers.length} spam PRs
        </Box>
      </HStack>

      <Text color="#8b949e" fontSize="sm" mb={5}>
        These PRs were closed as spam or low-effort contributions. Avoid these
        patterns:
      </Text>

      {/* Spammer Cards */}
      <VStack gap={3} align="stretch">
        {spammers.map((spammer) => (
          <Link
            key={spammer.prNumber}
            href={`https://github.com/${owner}/${repo}/pull/${spammer.prNumber}`}
            target="_blank"
            style={{ textDecoration: "none" }}
          >
            <Flex
              bg="#0d1117"
              border="1px solid #21262d"
              borderRadius="md"
              p={4}
              align="center"
              gap={4}
              transition="all 0.2s ease"
              _hover={{
                borderColor: "#f85149",
                bg: "#1c2128",
              }}
              role="group"
            >
              {/* Avatar */}
              <Avatar.Root size="sm">
                <Avatar.Image src={spammer.avatarUrl} />
                <Avatar.Fallback>
                  {spammer.username.substring(0, 2).toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>

              {/* Info */}
              <VStack align="start" gap={0} flex={1}>
                <HStack gap={2}>
                  <Text color="#c9d1d9" fontWeight="500" fontSize="sm">
                    @{spammer.username}
                  </Text>
                  <Text color="#6e7681" fontSize="xs">
                    PR #{spammer.prNumber}
                  </Text>
                </HStack>
                <Text color="#f85149" fontSize="xs">
                  {spammer.reason}
                </Text>
              </VStack>

              {/* External Link Icon */}
              <Box
                color="#6e7681"
                transition="all 0.2s ease"
                _groupHover={{
                  color: "#f85149",
                  transform: "translateX(2px)",
                }}
              >
                <FaExternalLinkAlt size={12} />
              </Box>
            </Flex>
          </Link>
        ))}
      </VStack>
    </Box>
  );
}
