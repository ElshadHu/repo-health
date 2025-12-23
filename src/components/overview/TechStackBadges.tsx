"use client";

import { Box, Text, HStack } from "@chakra-ui/react";

const TECH_ICONS: Record<string, string> = {
  "Next.js": "⚡",
  React: "⚛️",
  TypeScript: "🔷",
  JavaScript: "🟨",
  Prisma: "🔺",
  tRPC: "🔗",
  Tailwind: "🎨",
  "Chakra UI": "💠",
  Jest: "🧪",
  Docker: "🐳",
  PostgreSQL: "🐘",
  MySQL: "🐬",
  Redis: "🔴",
  MongoDB: "🍃",
  GraphQL: "◻️",
  Express: "🚂",
  Node: "🟢",
  Python: "🐍",
  Go: "🔵",
  Rust: "🦀",
};

type Props = {
  stack: string[];
};

export function TechStackBadges({ stack }: Props) {
  if (!stack.length) return null;

  return (
    <Box mb={8}>
      <HStack mb={4}>
        <Text fontSize="lg" fontWeight="600" color="#c9d1d9">
          ⚡ Tech Stack
        </Text>
        <Box
          bg="#238636"
          color="white"
          px={2}
          py={1}
          borderRadius="md"
          fontSize="xs"
        >
          AI Detected
        </Box>
      </HStack>
      <HStack flexWrap="wrap" gap={3}>
        {stack.map((tech) => (
          <Box
            key={tech}
            bg="#21262d"
            border="1px solid #30363d"
            px={4}
            py={2}
            borderRadius="lg"
          >
            <Text color="#c9d1d9">
              {TECH_ICONS[tech] || "📦"} {tech}
            </Text>
          </Box>
        ))}
      </HStack>
    </Box>
  );
}
