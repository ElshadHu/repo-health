"use client";

import { Badge } from "@chakra-ui/react";

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  tests: { bg: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }, // Red
  style: { bg: "rgba(168, 85, 247, 0.2)", color: "#a855f7" }, // Purple
  scope: { bg: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" }, // Blue
  setup: { bg: "rgba(245, 158, 11, 0.2)", color: "#f59e0b" }, // Amber/Orange
  breaking: { bg: "rgba(220, 38, 38, 0.25)", color: "#dc2626" }, // Darker Red
  docs: { bg: "rgba(34, 197, 94, 0.2)", color: "#22c55e" }, // Green
};

type Props = {
  category: string;
};

export function CategoryBadge({ category }: Props) {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.tests;

  return (
    <Badge
      bg={colors.bg}
      color={colors.color}
      px={3}
      py={1}
      borderRadius="full"
      fontSize="xs"
      fontWeight="600"
      textTransform="uppercase"
    >
      {category}
    </Badge>
  );
}
