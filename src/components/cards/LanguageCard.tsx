import { Box, Heading, HStack, Badge } from "@chakra-ui/react";

export function LanguageCard({
  languages,
}: {
  languages: Record<string, number>;
}) {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);

  return (
    <Box
      bg="#161b22"
      border="1px solid #30363d"
      p={8}
      borderRadius="lg"
      boxShadow="0 8px 24px rgba(0, 0, 0, 0.5)"
    >
      <Heading size="xl" mb={6} color="#c9d1d9">
        💻 Languages
      </Heading>
      <HStack gap={3} flexWrap="wrap">
        {Object.entries(languages).map(([lang, bytes]) => {
          const percentage = ((bytes / total) * 100).toFixed(1);
          return (
            <Badge
              key={lang}
              bg="#1f6feb"
              color="white"
              px={4}
              py={2}
              borderRadius="full"
              fontSize="md"
            >
              {lang} ({percentage}%)
            </Badge>
          );
        })}
      </HStack>
    </Box>
  );
}
