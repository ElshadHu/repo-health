import {
  Box,
  Heading,
  Text,
  Badge,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaStar,
  FaCodeBranch,
  FaCode,
  FaExclamationCircle,
} from "react-icons/fa";

type RepoStats = {
  stars: number;
  forks: number;
  commits: number;
  openIssues: number;
};

export function RepositoryCard({
  name,
  description,
  language,
  stats,
  languages,
}: {
  name: string;
  description?: string | null;
  language?: string | null;
  stats?: RepoStats;
  languages?: Record<string, number>;
}) {
  return (
    <Box bg="#161b22" border="1px solid #30363d" p={6} borderRadius="lg">
      {/* Header */}
      <Box mb={4}>
        <Heading size="2xl" mb={2} color="#c9d1d9">
          {name}
        </Heading>
        <Text color="#8b949e" fontSize="md" mb={3}>
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

      {/* Stats Row */}
      {stats && (
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={3} mb={4}>
          <HStack
            bg="#0d1117"
            border="1px solid #30363d"
            p={3}
            borderRadius="md"
            justify="center"
          >
            <FaStar color="#d29922" />
            <Text color="#c9d1d9" fontWeight="600">
              {stats.stars.toLocaleString()}
            </Text>
            <Text color="#6e7681" fontSize="xs">
              stars
            </Text>
          </HStack>
          <HStack
            bg="#0d1117"
            border="1px solid #30363d"
            p={3}
            borderRadius="md"
            justify="center"
          >
            <FaCodeBranch color="#8b949e" />
            <Text color="#c9d1d9" fontWeight="600">
              {stats.forks.toLocaleString()}
            </Text>
            <Text color="#6e7681" fontSize="xs">
              forks
            </Text>
          </HStack>
          <HStack
            bg="#0d1117"
            border="1px solid #30363d"
            p={3}
            borderRadius="md"
            justify="center"
          >
            <FaCode color="#238636" />
            <Text color="#c9d1d9" fontWeight="600">
              {stats.commits.toLocaleString()}
            </Text>
            <Text color="#6e7681" fontSize="xs">
              commits
            </Text>
          </HStack>
          <HStack
            bg="#0d1117"
            border="1px solid #30363d"
            p={3}
            borderRadius="md"
            justify="center"
          >
            <FaExclamationCircle color="#f85149" />
            <Text color="#c9d1d9" fontWeight="600">
              {stats.openIssues.toLocaleString()}
            </Text>
            <Text color="#6e7681" fontSize="xs">
              issues
            </Text>
          </HStack>
        </SimpleGrid>
      )}

      {/* Languages */}
      {languages &&
        Object.keys(languages).length > 0 &&
        (() => {
          const total = Object.values(languages).reduce((a, b) => a + b, 0);
          return (
            <HStack gap={2} flexWrap="wrap">
              {Object.entries(languages)
                .slice(0, 6)
                .map(([lang, bytes]) => {
                  const percent = (bytes / total) * 100;
                  return (
                    <Badge
                      key={lang}
                      bg="#21262d"
                      color="#58a6ff"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                    >
                      {lang} ({percent.toFixed(1)}%)
                    </Badge>
                  );
                })}
            </HStack>
          );
        })()}
    </Box>
  );
}
