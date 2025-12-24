"use client";

import { Box, Text, HStack, Badge } from "@chakra-ui/react";
import { ResponsiveSankey } from "@nivo/sankey";
import type { ContributorFunnel } from "@/server/types";
import { FaUsers } from "react-icons/fa";

type Props = {
  funnel: ContributorFunnel;
};

export function ContributorSankey({ funnel }: Props) {
  const total =
    funnel.firstTime +
    funnel.secondContribution +
    funnel.regular +
    funnel.coreTeam;

  // Sankey diagram data
  const data = {
    nodes: [
      { id: "First PR", color: "#58a6ff" },
      { id: "2nd Contribution", color: "#3fb950" },
      { id: "Regular (3-9)", color: "#a371f7" },
      { id: "Core Team (10+)", color: "#f0883e" },
    ],
    links: [
      {
        source: "First PR",
        target: "2nd Contribution",
        value: funnel.secondContribution + funnel.regular + funnel.coreTeam,
      },
      {
        source: "2nd Contribution",
        target: "Regular (3-9)",
        value: funnel.regular + funnel.coreTeam,
      },
      {
        source: "Regular (3-9)",
        target: "Core Team (10+)",
        value: funnel.coreTeam,
      },
    ].filter((link) => link.value > 0), // Remove zero-value links
  };

  // Calculate retention percentages
  const retainedAfterFirst =
    total > 0
      ? Math.round(
          ((funnel.secondContribution + funnel.regular + funnel.coreTeam) /
            total) *
            100
        )
      : 0;

  const retentionRate =
    funnel.firstTime > 0
      ? Math.round(
          ((funnel.regular + funnel.coreTeam) /
            (funnel.firstTime +
              funnel.secondContribution +
              funnel.regular +
              funnel.coreTeam)) *
            100
        )
      : 0;

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
      {/* Header */}
      <HStack gap={3} mb={4}>
        <FaUsers color="#58a6ff" size={20} />
        <Text fontSize="lg" fontWeight="bold" color="#c9d1d9">
          Contributor Journey
        </Text>
      </HStack>

      {/* Stats Summary */}
      <HStack gap={4} mb={4} flexWrap="wrap">
        <Badge bg="#58a6ff" color="white" px={3} py={1} borderRadius="md">
          {funnel.firstTime} First-time
        </Badge>
        <Badge bg="#3fb950" color="white" px={3} py={1} borderRadius="md">
          {funnel.secondContribution} Returned
        </Badge>
        <Badge bg="#a371f7" color="white" px={3} py={1} borderRadius="md">
          {funnel.regular} Regular
        </Badge>
        <Badge bg="#f0883e" color="white" px={3} py={1} borderRadius="md">
          {funnel.coreTeam} Core
        </Badge>
      </HStack>

      {/* Retention insight */}
      <Text color="#8b949e" fontSize="sm" mb={4}>
        <Text as="span" color="#f85149" fontWeight="bold">
          {100 - retainedAfterFirst}%
        </Text>{" "}
        of contributors don&apos;t return after their first PR
      </Text>
      <Text color="8b949e" fontSize="sm">
        <Text as="span" color="3fb950" fontWeight="bold">
          {retentionRate}%
        </Text>
        become regular contributors
      </Text>

      {/* Sankey Diagram */}
      {data.links.length > 0 ? (
        <Box height="200px">
          <ResponsiveSankey
            data={data}
            margin={{ top: 10, right: 80, bottom: 10, left: 80 }}
            align="justify"
            colors={["#58a6ff", "#3fb950", "#a371f7", "#f0883e"]}
            nodeOpacity={1}
            nodeThickness={18}
            nodeInnerPadding={3}
            nodeBorderWidth={0}
            nodeBorderRadius={3}
            linkOpacity={0.5}
            linkHoverOpacity={0.8}
            linkBlendMode="normal"
            enableLinkGradient
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={8}
            labelTextColor="#8b949e"
            theme={{
              text: { fill: "#8b949e", fontSize: 11 },
              tooltip: {
                container: {
                  background: "#161b22",
                  border: "1px solid #30363d",
                  color: "#c9d1d9",
                },
              },
            }}
          />
        </Box>
      ) : (
        <Text color="#6e7681" textAlign="center" py={8}>
          Not enough data to show contributor flow
        </Text>
      )}
    </Box>
  );
}
