import { Box, Heading, Text, Badge, HStack } from "@chakra-ui/react";

export function RepositoryCard({
  name,
  description,
  language,
}: {
  name: string;
  description?: string | null;
  language?: string | null;
}) {
  return (
    <Box
      bg="#161b22"
      border="1px solid #30363d"
      p={8}
      borderRadius="lg"
      boxShadow="0 8px 24px rgba(0, 0, 0, 0.5)"
    >
      <HStack justify="space-between" align="start" mb={4}>
        <Box>
          <Heading size="3xl" mb={2} color="#c9d1d9">
            {name}
          </Heading>
          <Text color="#8b949e" fontSize="lg" mb={4}>
            {description || "No description available"}
          </Text>
          {language && (
            <Badge
              bg="#1f6feb"
              color="white"
              variant="solid"
              px={3}
              py={1}
              borderRadius="full"
            >
              {language}
            </Badge>
          )}
        </Box>
      </HStack>
    </Box>
  );
}
