"use client";

import { Box, Text, VStack, HStack, Badge } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";

type Props = {
  whereToLook: Record<string, string[]>;
  owner: string;
  repo: string;
  defaultBranch?: string;
};

export function WhereToLook({
  whereToLook,
  owner,
  repo,
  defaultBranch = "main",
}: Props) {
  const entries = Object.entries(whereToLook);
  if (!entries.length) return null;

  const githubUrl = (path: string) =>
    `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${path}`;

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
        <FaSearch color="#d29922" size={18} />
        <Text fontSize="lg" fontWeight="600" color="#c9d1d9">
          Where to Look
        </Text>
      </HStack>
      <VStack align="stretch" gap={4}>
        {entries.map(([category, files]) => (
          <Box key={category}>
            <Text
              color="#8b949e"
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
              mb={2}
            >
              {category.replace(/_/g, " ")}
            </Text>
            <HStack flexWrap="wrap" gap={2}>
              {files.map((file) => (
                <a
                  key={file}
                  href={githubUrl(file)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge
                    bg="#21262d"
                    color="#58a6ff"
                    fontFamily="mono"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="md"
                    _hover={{ bg: "#30363d" }}
                    cursor="pointer"
                    wordBreak="break-word"
                    whiteSpace="normal"
                  >
                    {file}
                  </Badge>
                </a>
              ))}
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
