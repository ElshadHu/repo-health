"use client";

import { Box, Text, VStack, Flex, HStack } from "@chakra-ui/react";
import { FaExternalLinkAlt, FaArrowRight, FaDoorOpen } from "react-icons/fa";

type EntryPoint = {
  path: string;
  description: string;
};

type Props = {
  entryPoints: EntryPoint[];
  owner: string;
  repo: string;
  defaultBranch?: string;
};

export function EntryPointsList({
  entryPoints,
  owner,
  repo,
  defaultBranch = "main",
}: Props) {
  if (!entryPoints.length) return null;

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
        <FaDoorOpen color="#f85149" size={18} />
        <Text fontSize="lg" fontWeight="600" color="#c9d1d9">
          Entry Points
        </Text>
      </HStack>
      <VStack align="stretch" gap={3}>
        {entryPoints.map((ep) => (
          <Flex
            key={ep.path}
            justify="space-between"
            align="flex-start"
            borderBottom="1px solid #21262d"
            pb={3}
          >
            <Box minWidth={0} flex={1}>
              <a
                href={githubUrl(ep.path)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Text
                  color="#58a6ff"
                  fontFamily="mono"
                  fontSize="sm"
                  wordBreak="break-word"
                >
                  {ep.path}
                </Text>
                <FaExternalLinkAlt size={10} color="#8b949e" />
              </a>
              <Text color="#8b949e" fontSize="xs" mt={1}>
                {ep.description}
              </Text>
            </Box>
            <FaArrowRight color="#8b949e" size={12} />
          </Flex>
        ))}
      </VStack>
    </Box>
  );
}
