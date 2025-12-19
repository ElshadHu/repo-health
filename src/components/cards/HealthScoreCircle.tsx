import { Box, Text, VStack, HStack, SimpleGrid } from "@chakra-ui/react";

type ScoreBreakdown = {
  activityScore: number;
  maintenanceScore: number;
  communityScore: number;
  documentationScore: number;
};

type HealthScoreCircleProps = {
  score: number; // 0-100
  breakdown?: ScoreBreakdown;
  size?: number; // diameter in px
  strokeWidth?: number;
};

// Scoring weights (matching server-side calculations.ts)
const WEIGHTS = {
  activity: {
    weight: 30,
    label: "Activity",
    description: "Commit frequency, recency, unique authors",
  },
  maintenance: {
    weight: 25,
    label: "Maintenance",
    description: "Issue ratio, project age, recent updates",
  },
  community: {
    weight: 20,
    label: "Community",
    description: "Stars, forks, contributors",
  },
  documentation: {
    weight: 25,
    label: "Documentation",
    description: "README, LICENSE, CONTRIBUTING, Code of Conduct",
  },
};

// Color thresholds
const SCORE_THRESHOLDS = [
  { min: 80, color: "#238636", label: "Excellent" },
  { min: 60, color: "#d29922", label: "Good" },
  { min: 40, color: "#db6d28", label: "Fair" },
  { min: 0, color: "#f85149", label: "Poor" },
];

const getColor = (score: number) => {
  const threshold = SCORE_THRESHOLDS.find((t) => score >= t.min);
  return threshold?.color ?? "#f85149";
};

const getLabel = (score: number) => {
  const threshold = SCORE_THRESHOLDS.find((t) => score >= t.min);
  return threshold?.label ?? "Poor";
};

// Individual score bar component
function ScoreBar({
  label,
  score,
  weight,
  description,
}: {
  label: string;
  score: number;
  weight: number;
  description: string;
}) {
  return (
    <Box>
      <HStack justify="space-between" mb={1}>
        <Text fontSize="sm" color="#c9d1d9" fontWeight="medium">
          {label}
        </Text>
        <HStack gap={2}>
          <Text fontSize="xs" color="#8b949e">
            {weight}%
          </Text>
          <Text fontSize="sm" color={getColor(score)} fontWeight="bold">
            {score}
          </Text>
        </HStack>
      </HStack>
      <Box bg="#30363d" borderRadius="full" h="6px" overflow="hidden">
        <Box
          bg={getColor(score)}
          h="100%"
          w={`${score}%`}
          borderRadius="full"
          transition="width 0.5s ease"
        />
      </Box>
      <Text fontSize="xs" color="#6e7681" mt={1}>
        {description}
      </Text>
    </Box>
  );
}

export function HealthScoreCircle({
  score,
  breakdown,
  size = 160,
  strokeWidth = 12,
}: HealthScoreCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;

  return (
    <VStack gap={6} align="stretch" width="100%">
      {/* Circle + Label Row */}
      <HStack justify="center" gap={8} flexWrap="wrap">
        {/* Circle */}
        <Box position="relative" width={size} height={size}>
          <svg width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#30363d"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={getColor(score)}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <VStack
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            gap={0}
          >
            <Text fontSize="3xl" fontWeight="bold" color="#c9d1d9">
              {score}
            </Text>
            <Text fontSize="xs" color={getColor(score)} fontWeight="medium">
              {getLabel(score)}
            </Text>
          </VStack>
        </Box>

        {/* Color Legend */}
        <VStack align="start" gap={2}>
          <Text fontSize="sm" color="#8b949e" fontWeight="medium" mb={1}>
            Score Thresholds
          </Text>
          {SCORE_THRESHOLDS.map((t) => (
            <HStack key={t.label} gap={2}>
              <Box w="12px" h="12px" borderRadius="sm" bg={t.color} />
              <Text fontSize="xs" color="#8b949e">
                {t.min}+ = {t.label}
              </Text>
            </HStack>
          ))}
        </VStack>
      </HStack>

      {/* Breakdown Bars */}
      {breakdown && (
        <Box borderTop="1px solid #30363d" pt={6}>
          <Text fontSize="md" color="#c9d1d9" fontWeight="semibold" mb={4}>
            Score Breakdown
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <ScoreBar
              label={WEIGHTS.activity.label}
              score={breakdown.activityScore}
              weight={WEIGHTS.activity.weight}
              description={WEIGHTS.activity.description}
            />
            <ScoreBar
              label={WEIGHTS.maintenance.label}
              score={breakdown.maintenanceScore}
              weight={WEIGHTS.maintenance.weight}
              description={WEIGHTS.maintenance.description}
            />
            <ScoreBar
              label={WEIGHTS.community.label}
              score={breakdown.communityScore}
              weight={WEIGHTS.community.weight}
              description={WEIGHTS.community.description}
            />
            <ScoreBar
              label={WEIGHTS.documentation.label}
              score={breakdown.documentationScore}
              weight={WEIGHTS.documentation.weight}
              description={WEIGHTS.documentation.description}
            />
          </SimpleGrid>
        </Box>
      )}
    </VStack>
  );
}
