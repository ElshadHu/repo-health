import { Box, Heading, Text } from "@chakra-ui/react";

export function PageHeader() {
  return (
    <Box textAlign="center" py={8}>
      <Heading
        size="6xl"
        mb={4}
        bgGradient="to-r"
        gradientFrom="#58a6ff"
        gradientTo="#1f6feb"
        bgClip="text"
      >
        Repository Health Analyzer
      </Heading>
      <Text fontSize="xl" color="#c9d1d9" opacity={0.9}>
        Analyze the health and activity of any GitHub repository
      </Text>
    </Box>
  );
}
