"use client";

import { Box, HStack, Badge, Text, Link as ChakraLink } from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";

// Import your type
import type { PatternAnomaly } from "@/server/services/anomaly";

const COLORS = {
  critical: { bg: "#f8514926", color: "#f85149" },
  warning: { bg: "#d2992226", color: "#d29922" },
  info: { bg: "#58a6ff26", color: "#58a6ff" },
};

// More descriptive labels for anomaly types
const TYPE_LABELS: Record<string, string> = {
  velocity: "Rapid Commits",
  churn: "Mass Deletion",
  time: "Off-Hours Activity",
  file: "Sensitive File",
  pattern: "Unusual Pattern",
};

type Props = { event: PatternAnomaly };

export function AnomalyEvent({ event }: Props) {
  const style = COLORS[event.severity];
  const typeLabel = TYPE_LABELS[event.type] || event.type;

  return (
    <Box
      bg="#21262d"
      borderLeft={`3px solid ${style.color}`}
      borderRadius="lg"
      p={4}
    >
      <HStack justify="space-between" mb={2} flexWrap="wrap">
        <HStack>
          <Badge bg={style.bg} color={style.color}>
            {event.severity.toUpperCase()}
          </Badge>
          <Text color="#c9d1d9" fontWeight="bold">
            {typeLabel}
          </Text>
          {event.zScore && (
            <Badge bg="#30363d" color="#8b949e">
              Z: {event.zScore}
            </Badge>
          )}
        </HStack>
        <Text color="#6e7681" fontSize="sm">
          {new Date(event.timestamp).toLocaleString()}
        </Text>
      </HStack>

      <Text color="#8b949e" fontSize="sm" mb={2}>
        {event.description}
      </Text>

      {event.links && (
        <HStack gap={3}>
          {event.links.commit && (
            <ChakraLink
              href={event.links.commit}
              target="_blank"
              color="#58a6ff"
              fontSize="xs"
            >
              Commit <FaExternalLinkAlt style={{ display: "inline" }} />
            </ChakraLink>
          )}
          {event.links.diff && (
            <ChakraLink
              href={event.links.diff}
              target="_blank"
              color="#58a6ff"
              fontSize="xs"
            >
              Diff <FaExternalLinkAlt style={{ display: "inline" }} />
            </ChakraLink>
          )}
        </HStack>
      )}
    </Box>
  );
}
