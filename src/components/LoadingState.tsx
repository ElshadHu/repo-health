import { Box, Spinner, Text } from "@chakra-ui/react";

export function LoadingState({
  message = "Analyzing repository...",
}: {
  message?: string;
}) {
  return (
    <Box
      bg="#161b22"
      border="1px solid #30363d"
      p={12}
      borderRadius="lg"
      boxShadow="0 8px 24px rgba(0, 0, 0, 0.5)"
      textAlign="center"
    >
      <Spinner size="xl" color="#58a6ff" mb={4} />
      <Text fontSize="lg" color="#c9d1d9">
        {message}
      </Text>
    </Box>
  );
}
