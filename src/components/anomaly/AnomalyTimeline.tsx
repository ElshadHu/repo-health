"use client";

import { VStack, Box, Text } from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { AnomalyEvent } from "./AnomalyEvent";
import type { PatternAnomaly } from "@/server/services/anomaly";

type Props = { events: PatternAnomaly[] };

export function AnomalyTimeline({ events }: Props) {
  if (events.length === 0) {
    return (
      <Box
        bg="#161b22"
        border="1px solid #238636"
        borderRadius="lg"
        p={8}
        textAlign="center"
      >
        <FaCheckCircle
          color="#238636"
          size={48}
          style={{ margin: "0 auto 16px" }}
        />
        <Text color="#238636" fontSize="xl" fontWeight="bold">
          No anomalies detected!
        </Text>
        <Text color="#8b949e" mt={2}>
          Commit patterns look normal.
        </Text>
      </Box>
    );
  }

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={6}>
      <Text fontSize="lg" fontWeight="bold" color="#c9d1d9" mb={4}>
        📅 Anomaly Timeline
      </Text>
      <VStack align="stretch" gap={3}>
        {events.map((event, i) => (
          <AnomalyEvent key={i} event={event} />
        ))}
      </VStack>
    </Box>
  );
}
