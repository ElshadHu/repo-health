"use client";

import { Box, VStack, HStack, Text, Badge } from "@chakra-ui/react";
import {
  FaLightbulb,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import type { ScoreInsights } from "@/server/types";

type Props = {
  insights: ScoreInsights;
  formulaScore: number;
  finalScore: number;
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "#238636";
  if (score >= 60) return "#d29922";
  if (score >= 40) return "#db6d28";
  return "#f85149";
};

const getScoreEmoji = (score: number) => {
  if (score >= 60) return "🟡";
  return "🔴";
};

function BreakdownItem({
  label,
  data,
}: {
  label: string;
  data: { score: number; reason: string; suggestion?: string };
}) {
  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="8px" p={4}>
      <HStack justify="space-between" mb={2}>
        <Text fontWeight="600" fontSize="0.9rem" color="#c9d1d9">
          {getScoreEmoji(data.score)} {label}
        </Text>
        <Text
          fontWeight="700"
          fontSize="1.1rem"
          color={getScoreColor(data.score)}
        >
          {data.score}/100
        </Text>
      </HStack>
      <Text color="#8b949e" fontSize="0.85rem" lineHeight="1.5" mb={2}>
        {data.reason}
      </Text>
      {data.suggestion && (
        <HStack
          bg="rgba(35,134,54,0.15)"
          color="#3fb950"
          p={2}
          borderRadius="6px"
          fontSize="0.8rem"
        >
          <FaCheckCircle />
          <Text>{data.suggestion}</Text>
        </HStack>
      )}
    </Box>
  );
}

export function ScoreInsightsPanel({
  insights,
  formulaScore,
  finalScore,
}: Props) {
  const { adjustment } = insights;
  const hasAdjustment = adjustment.shouldAdjust && adjustment.amount !== 0;

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="12px" p={6}>
      {/* Header */}
      <HStack gap={3} mb={4}>
        <FaLightbulb color="#8b949e" size={18} />
        <Text fontSize="1rem" fontWeight="600" color="#c9d1d9">
          Score Analysis
        </Text>
        <Badge
          bg="#21262d"
          color="#8b949e"
          px={2}
          py={1}
          borderRadius="md"
          fontSize="0.7rem"
        >
          CHAOSS
        </Badge>
      </HStack>

      {/* Summary */}
      <Box
        bg="#0d1117"
        border="1px solid #30363d"
        p={4}
        borderRadius="8px"
        mb={5}
      >
        <Text color="#8b949e" fontSize="0.9rem" lineHeight="1.6">
          {insights.summary}
        </Text>
      </Box>

      {/* Contextual Adjustment */}
      {hasAdjustment && (
        <Box
          bg={
            adjustment.amount > 0
              ? "rgba(35,134,54,0.15)"
              : "rgba(248,81,73,0.15)"
          }
          border={`1px solid ${adjustment.amount > 0 ? "#238636" : "#f85149"}`}
          borderRadius="8px"
          p={4}
          mb={5}
        >
          <HStack mb={2}>
            {adjustment.amount > 0 ? (
              <FaArrowUp color="#3fb950" />
            ) : (
              <FaArrowDown color="#f85149" />
            )}
            <Text fontWeight="600" color="#c9d1d9">
              Contextual Adjustment: {adjustment.amount > 0 ? "+" : ""}
              {adjustment.amount} points
            </Text>
            <Badge
              bg={
                adjustment.confidence === "high"
                  ? "rgba(35,134,54,0.2)"
                  : adjustment.confidence === "medium"
                    ? "rgba(210,153,34,0.2)"
                    : "rgba(139,148,158,0.2)"
              }
              color={
                adjustment.confidence === "high"
                  ? "#3fb950"
                  : adjustment.confidence === "medium"
                    ? "#d29922"
                    : "#8b949e"
              }
            >
              {adjustment.confidence} confidence
            </Badge>
          </HStack>
          <Text color="#8b949e" fontSize="0.9rem">
            {adjustment.reason}
          </Text>
          <HStack mt={3} gap={4}>
            <Text color="#6e7681" fontSize="0.85rem">
              Formula:{" "}
              <Text as="span" color="#c9d1d9" fontWeight="bold">
                {formulaScore}
              </Text>
            </Text>
            <Text color="#6e7681" fontSize="0.85rem">
              Final:{" "}
              <Text
                as="span"
                color={getScoreColor(finalScore)}
                fontWeight="bold"
              >
                {finalScore}
              </Text>
            </Text>
          </HStack>
        </Box>
      )}

      {/* Breakdown Grid */}
      <Box
        display="grid"
        gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
        gap={4}
        mb={5}
      >
        <BreakdownItem label="Activity" data={insights.breakdown.activity} />
        <BreakdownItem
          label="Maintenance"
          data={insights.breakdown.maintenance}
        />
        <BreakdownItem label="Community" data={insights.breakdown.community} />
        <BreakdownItem
          label="Documentation"
          data={insights.breakdown.documentation}
        />
      </Box>

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <Box>
          <Text fontWeight="600" fontSize="0.9rem" color="#c9d1d9" mb={3}>
            🎯 Priority Actions to Improve Score
          </Text>
          <VStack align="stretch" gap={2}>
            {insights.recommendations.map((rec, i) => (
              <HStack
                key={i}
                bg="#21262d"
                p={3}
                borderRadius="8px"
                fontSize="0.9rem"
              >
                <Text color="#238636">✓</Text>
                <Text color="#c9d1d9">
                  <Text as="span" fontWeight="bold">
                    Priority {i + 1}:
                  </Text>{" "}
                  {rec}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
