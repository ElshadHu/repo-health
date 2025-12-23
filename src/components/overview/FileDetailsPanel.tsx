"use client";

import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  IconButton,
  Link,
} from "@chakra-ui/react";
import {
  FaTimes,
  FaExternalLinkAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import type { IssueReference } from "@/server/types";

type Props = {
  filePath: string;
  description: string | null;
  issues: IssueReference[];
  onClose: () => void;
};

export function FileDetailsPanel({
  filePath,
  description,
  issues,
  onClose,
}: Props) {
  const fileName = filePath.split("/").pop() || filePath;

  return (
    <Box
      position="absolute"
      right={4}
      top={4}
      width="320px"
      bg="#161b22"
      border="1px solid"
      borderColor="#30363d"
      borderRadius="lg"
      p={4}
      zIndex={10}
    >
      {/* Header */}
      <HStack justify="space-between" mb={4}>
        <VStack align="start" gap={0}>
          <Text fontSize="md" fontWeight="600" color="#c9d1d9">
            📄 {fileName}
          </Text>
          <Text fontSize="xs" color="#6e7681">
            {filePath}
          </Text>
        </VStack>
        <IconButton
          aria-label="Close"
          size="sm"
          variant="ghost"
          color="#8b949e"
          onClick={onClose}
        >
          <FaTimes />
        </IconButton>
      </HStack>

      {/* Description */}
      {description && (
        <Box mb={4} p={3} bg="#21262d" borderRadius="md">
          <Text color="#c9d1d9" fontSize="sm">
            {description}
          </Text>
        </Box>
      )}

      {/* Issues */}
      <Text fontSize="sm" fontWeight="600" color="#8b949e" mb={2}>
        RELATED ISSUES ({issues.length})
      </Text>
      <VStack align="stretch" gap={2} maxH="300px" overflowY="auto">
        {issues.map((issue) => (
          <Link
            key={issue.number}
            href={issue.url}
            target="_blank"
            _hover={{ textDecoration: "none" }}
          >
            <Box
              p={3}
              bg="#21262d"
              borderRadius="md"
              borderLeft="3px solid"
              borderLeftColor={
                issue.labels.includes("bug") ? "#f85149" : "#a371f7"
              }
              _hover={{ bg: "#30363d" }}
            >
              <HStack justify="space-between">
                <Text color="#58a6ff" fontSize="sm">
                  #{issue.number}
                </Text>
                <FaExternalLinkAlt size={10} color="#6e7681" />
              </HStack>
              <Text color="#c9d1d9" fontSize="sm" lineClamp={2}>
                {issue.title}
              </Text>
              {issue.isMultiFile && (
                <HStack mt={2} color="#d29922" fontSize="xs">
                  <FaExclamationTriangle size={10} />
                  <Text>Affects {issue.relatedFiles.length + 1} files</Text>
                </HStack>
              )}
            </Box>
          </Link>
        ))}
      </VStack>
    </Box>
  );
}
