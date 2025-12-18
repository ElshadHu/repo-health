import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react";

interface Contributor {
  username?: string;
  contributions: number;
}

export function ContributorCard({
  contributors,
  maxDisplay = 6,
}: {
  contributors: Contributor[];
  maxDisplay?: number;
}) {
  return (
    <Box
      bg="#161b22"
      border="1px solid #30363d"
      p={8}
      borderRadius="lg"
      boxShadow="0 8px 24px rgba(0, 0, 0, 0.5)"
    >
      <Heading size="xl" mb={6} color="#c9d1d9">
        👥 Top Contributors
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {contributors.slice(0, maxDisplay).map((contributor) => (
          <Box
            key={contributor.username}
            p={4}
            bg="#0d1117"
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor="#58a6ff"
          >
            <Text fontWeight="bold" color="#c9d1d9">
              {contributor.username}
            </Text>
            <Text fontSize="sm" color="#8b949e">
              {contributor.contributions} contributions
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
