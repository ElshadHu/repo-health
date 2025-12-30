import {
  Box,
  Heading,
  Text,
  Badge,
  HStack,
  SimpleGrid,
  Flex,
} from "@chakra-ui/react";
import { FaStar, FaCodeBranch, FaCode, FaBug } from "react-icons/fa";
import { SponsorButton } from "@/components/funding";
import type { FundingLink } from "@/server/types";

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
  fundingLinks,
}: {
  name: string;
  description?: string | null;
  language?: string | null;
  stats?: RepoStats;
  languages?: Record<string, number>;
  fundingLinks?: FundingLink[];
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

      {/* Stats Row with Sponsor Button */}
      {stats && (
        <Flex gap={3} mb={4} align="center" wrap="wrap">
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={3} flex="1">
            <HStack
              bg="#0d1117"
              border="1px solid #30363d"
              px={4}
              py={3}
              borderRadius="md"
              justify="center"
              minW="140px"
            >
              <FaStar color="#d29922" size={14} />
              <Text color="#c9d1d9" fontWeight="600" fontSize="md">
                {stats.stars.toLocaleString()}
              </Text>
              <Text color="#6e7681" fontSize="sm">
                stars
              </Text>
            </HStack>
            <HStack
              bg="#0d1117"
              border="1px solid #30363d"
              px={4}
              py={3}
              borderRadius="md"
              justify="center"
              minW="140px"
            >
              <FaCodeBranch color="#8b949e" size={14} />
              <Text color="#c9d1d9" fontWeight="600" fontSize="md">
                {stats.forks.toLocaleString()}
              </Text>
              <Text color="#6e7681" fontSize="sm">
                forks
              </Text>
            </HStack>
            <HStack
              bg="#0d1117"
              border="1px solid #30363d"
              px={4}
              py={3}
              borderRadius="md"
              justify="center"
              minW="140px"
            >
              <FaCode color="#238636" size={14} />
              <Text color="#c9d1d9" fontWeight="600" fontSize="md">
                {stats.commits.toLocaleString()}
              </Text>
              <Text color="#6e7681" fontSize="sm">
                commits
              </Text>
            </HStack>
            <HStack
              bg="#0d1117"
              border="1px solid #30363d"
              px={4}
              py={3}
              borderRadius="md"
              justify="center"
              minW="140px"
            >
              <FaBug color="#f85149" size={14} />
              <Text color="#c9d1d9" fontWeight="600" fontSize="md">
                {stats.openIssues.toLocaleString()}
              </Text>
              <Text color="#6e7681" fontSize="sm">
                issues
              </Text>
            </HStack>
          </SimpleGrid>

          {/* Sponsor Button */}
          {fundingLinks && fundingLinks.length > 0 && (
            <SponsorButton links={fundingLinks} />
          )}
        </Flex>
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
