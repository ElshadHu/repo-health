"use client";
import { Box, VStack, Text, HStack, Button } from "@chakra-ui/react";
import { FaCopy } from "react-icons/fa";
import type { CriticalIssue } from "@/server/types/setup";

const colors = {
  critical: { bg: "#f8514933", text: "#f85149", border: "#f85149" },
  warning: { bg: "#f0883e33", text: "#f0883e", border: "#f0883e" },
  info: { bg: "#58a6ff33", text: "#58a6ff", border: "#58a6ff" },
};

export function IssueCard({ issue }: { issue: CriticalIssue }) {
  const c = colors[issue.severity];
  const copy = () => {
    if (issue.solution.command)
      navigator.clipboard.writeText(issue.solution.command);
  };
  return (
    <Box
      bg="#161b22"
      border="1px solid #30363d"
      borderLeft={`3px solid ${c.border}`}
      borderRadius="lg"
      p={4}
    >
      <VStack align="stretch" gap={2}>
        <Text color="#f0f6fc" fontWeight="600" fontSize="sm">
          {issue.title}
        </Text>
        <Text color="#8b949e" fontSize="xs">
          {issue.description}
        </Text>
        {issue.solution.command && (
          <HStack
            bg="#0d1117"
            border="1px solid #30363d"
            borderRadius="md"
            p={2}
            justify="space-between"
          >
            <Text fontFamily="mono" fontSize="xs" color="#79c0ff">
              {issue.solution.command}
            </Text>
            <Button size="sm" variant="ghost" onClick={copy}>
              <FaCopy size={12} />
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}
