import { Box, Heading, VStack, Text, HStack } from "@chakra-ui/react";

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export function CommitListCard({
  commits,
  maxDisplay = 5,
}: {
  commits: Commit[];
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
      <Heading size="xl" mb={4} color="#c9d1d9">
        📊 Recent Commits (Last 90 Days)
      </Heading>
      <VStack gap={3} align="stretch">
        {commits.slice(0, maxDisplay).map((commit) => (
          <Box
            key={commit.sha}
            p={4}
            bg="#0d1117"
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor="#58a6ff"
          >
            <Text fontWeight="bold" color="#c9d1d9" fontSize="sm" mb={1}>
              {commit.message.split("\n")[0]}
            </Text>
            <HStack gap={4} fontSize="xs" color="#8b949e">
              <Text>👤 {commit.author}</Text>
              <Text>📅 {new Date(commit.date).toLocaleDateString()}</Text>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
