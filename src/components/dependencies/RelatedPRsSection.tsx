"use client";

import { Box, Text, Table, Badge, HStack } from "@chakra-ui/react";
import { FaGithub, FaCheckCircle, FaCodeBranch } from "react-icons/fa";
import type { RelatedPRs } from "@/server/types";

type Props = {
  prs: RelatedPRs[];
  isLoading?: boolean;
};

const STATUS_COLORS = {
  merged: "#a371f7",
  open: "#238636",
  closed: "#f85149",
};

export function RelatedPRsSection({ prs, isLoading }: Props) {
  if (isLoading) {
    return (
      <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={4}>
        <Text color="#8b949e">Loading related PRs...</Text>
      </Box>
    );
  }

  if (prs.length === 0) {
    return (
      <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={4}>
        <Text fontSize="md" fontWeight="bold" color="#c9d1d9" mb={2}>
          Related PRs
        </Text>
        <Text color="#8b949e" fontSize="sm">
          No merged PRs found for this vulnerability.
        </Text>
      </Box>
    );
  }

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={4}>
      <HStack mb={3} gap={2}>
        <FaGithub color="#8b949e" />
        <Text fontSize="md" fontWeight="bold" color="#c9d1d9">
          Related PRs ({prs.length})
        </Text>
      </HStack>

      <Box overflowX="auto">
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row bg="#0d1117">
              <Table.ColumnHeader color="#8b949e" borderColor="#30363d">
                Repo
              </Table.ColumnHeader>
              <Table.ColumnHeader color="#8b949e" borderColor="#30363d">
                PR #
              </Table.ColumnHeader>
              <Table.ColumnHeader color="#8b949e" borderColor="#30363d">
                Title
              </Table.ColumnHeader>
              <Table.ColumnHeader color="#8b949e" borderColor="#30363d">
                Status
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {prs.map((pr, idx) => (
              <Table.Row
                key={`${pr.repo}-${pr.prNumber}-${idx}`}
                bg="#0d1117"
                _hover={{ bg: "#21262d" }}
                transition="background 0.2s"
              >
                <Table.Cell borderColor="#30363d" color="#8b949e" fontSize="sm">
                  {pr.repo}
                </Table.Cell>
                <Table.Cell borderColor="#30363d">
                  <a href={pr.url} target="_blank" rel="noopener noreferrer">
                    <HStack gap={1} color="#58a6ff">
                      <FaCodeBranch size={12} />
                      <Text fontSize="sm">#{pr.prNumber}</Text>
                    </HStack>
                  </a>
                </Table.Cell>
                <Table.Cell
                  borderColor="#30363d"
                  color="#c9d1d9"
                  fontSize="sm"
                  maxW="300px"
                  truncate
                >
                  {pr.title}
                </Table.Cell>
                <Table.Cell borderColor="#30363d">
                  <Badge
                    bg={STATUS_COLORS[pr.status]}
                    color="white"
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="xs"
                  >
                    <HStack gap={1}>
                      {pr.status === "merged" && <FaCheckCircle size={10} />}
                      <Text>{pr.status}</Text>
                    </HStack>
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
}
