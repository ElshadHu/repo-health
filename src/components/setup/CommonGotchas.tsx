"use client";
import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import { FaExclamationTriangle } from "react-icons/fa";
import { IssueCard } from "./IssueCard";
import type { CriticalIssue } from "@/server/types/setup";

interface CommonGotchasProps {
  issues: CriticalIssue[];
}

export function CommonGotchas({ issues }: CommonGotchasProps) {
  if (issues.length === 0) return null;

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={4}>
      <HStack gap={2} mb={3}>
        <FaExclamationTriangle color="#f0883e" size={14} />
        <Text color="#f0f6fc" fontWeight="600" fontSize="sm">
          Common Gotchas
        </Text>
        <Text color="#8b949e" fontSize="xs" ml="auto">
          {issues.length} {issues.length === 1 ? "issue" : "issues"}
        </Text>
      </HStack>
      <VStack
        align="stretch"
        gap={3}
        maxH={issues.length > 2 ? "400px" : "none"}
        overflowY={issues.length > 2 ? "auto" : "visible"}
        pr={issues.length > 2 ? 2 : 0}
      >
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </VStack>
    </Box>
  );
}
