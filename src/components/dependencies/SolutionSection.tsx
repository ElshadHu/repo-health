"use client";

import { Box, Text, HStack, VStack, Badge, Button } from "@chakra-ui/react";
import {
  FaExternalLinkAlt,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import type { IssueCheckResult } from "@/server/types";

type Props = {
  vulnId: string;
  osvUrl: string;
  issueStatus: IssueCheckResult;
  owner: string;
  repo: string;
  packageName: string;
  packageVersion: string;
  summary: string;
};

export function SolutionSection({
  vulnId,
  osvUrl,
  issueStatus,
  owner,
  repo,
  packageName,
  packageVersion,
  summary,
}: Props) {
  const newIssueUrl = `https://github.com/${owner}/${repo}/issues/new?title=${encodeURIComponent(
    `Security: ${packageName} vulnerability (${vulnId})`
  )}&body=${encodeURIComponent(
    `## Vulnerability Details\n\n- **Package:** ${packageName}@${packageVersion}\n- **ID:** ${vulnId}\n- **Summary:** ${summary}\n\n## References\n- ${osvUrl}`
  )}`;

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={4}>
      <Text fontSize="md" fontWeight="bold" color="#c9d1d9" mb={3}>
        Solution Links
      </Text>

      <VStack align="stretch" gap={3}>
        {/* OSV Link */}
        <HStack justify="space-between">
          <Text color="#8b949e" fontSize="sm">
            OSV Details
          </Text>
          <a href={osvUrl} target="_blank" rel="noopener noreferrer">
            <Button
              size="xs"
              variant="outline"
              borderColor="#30363d"
              color="#58a6ff"
              _hover={{ bg: "#21262d" }}
            >
              <FaExternalLinkAlt />
              <Text ml={2}>View</Text>
            </Button>
          </a>
        </HStack>

        {/* Issue Status */}
        <HStack justify="space-between">
          <Text color="#8b949e" fontSize="sm">
            Issue Status
          </Text>
          {issueStatus.exists ? (
            <HStack gap={2}>
              <Badge bg="#238636" color="white" px={2} py={1} borderRadius="md">
                <HStack gap={1}>
                  <FaCheckCircle size={10} />
                  <Text>Exists</Text>
                </HStack>
              </Badge>
              <a
                href={issueStatus.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="xs"
                  variant="outline"
                  borderColor="#30363d"
                  color="#58a6ff"
                  _hover={{ bg: "#21262d" }}
                >
                  View Issue
                </Button>
              </a>
            </HStack>
          ) : (
            <HStack gap={2}>
              <Badge bg="#6e7681" color="white" px={2} py={1} borderRadius="md">
                <HStack gap={1}>
                  <FaExclamationCircle size={10} />
                  <Text>Not Found</Text>
                </HStack>
              </Badge>
              <a href={newIssueUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  size="xs"
                  bg="#238636"
                  color="white"
                  _hover={{ bg: "#2ea043" }}
                >
                  Create Issue
                </Button>
              </a>
            </HStack>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}
