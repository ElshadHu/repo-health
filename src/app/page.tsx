"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  VStack,
  Text,
  SimpleGrid,
  HStack,
  Badge,
  Spinner,
  createToaster,
  Toaster,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { trpc } from "@/trpc/client";
import { RepoSearchInput } from "@/components/repoInput";
import { AuthButton } from "@/components/AuthButton";

const toaster = createToaster({
  placement: "top",
  duration: 5000,
});

export default function HomePage() {
  const { data: session, status } = useSession();
  const [searchParams, setSearchParams] = useState<{
    owner: string;
    repo: string;
  } | null>(null);

  const { data, isLoading, error } = trpc.github.getCompleteAnalysis.useQuery(
    searchParams!,
    {
      enabled: searchParams !== null,
    }
  );

  // Show toast for  errors
  useEffect(() => {
    if (error) {
      toaster.create({
        title: "Error",
        description: error.message,
        type: "error",
      });
    }
  }, [error]);

  const handleSearch = (owner: string, repo: string) => {
    setSearchParams({ owner, repo });
  };

  return (
    <Box
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      minH="100vh"
      py={12}
    >
      <Container maxW="container.xl">
        <VStack gap={10} align="stretch">
          <Box textAlign="center" py={8}>
            <HStack justify="flex-end" mb={4}>
              <AuthButton />
            </HStack>
            <Heading
              size="6xl"
              mb={4}
              bgGradient="to-r"
              gradientFrom="white"
              gradientTo="gray.200"
              bgClip="text"
            >
              Repository Health Analyzer
            </Heading>
            <Text fontSize="xl" color="white" opacity={0.9}>
              Analyze the health and activity of any GitHub repository
            </Text>
          </Box>

          <Box bg="white" p={8} borderRadius="2xl" boxShadow="2xl">
            <RepoSearchInput onSearch={handleSearch} isLoading={isLoading} />
          </Box>

          <Toaster toaster={toaster}>
            {(toast) => (
              <Box
                bg={toast.type === "error" ? "red.500" : "green.500"}
                color="white"
                p={4}
                borderRadius="md"
                boxShadow="lg"
              >
                <Text fontWeight="bold">{toast.title}</Text>
                {toast.description && (
                  <Text fontSize="sm">{toast.description}</Text>
                )}
              </Box>
            )}
          </Toaster>

          {isLoading && (
            <Box
              bg="white"
              p={12}
              borderRadius="2xl"
              boxShadow="2xl"
              textAlign="center"
            >
              <Spinner size="xl" colorPalette="purple" mb={4} />
              <Text fontSize="lg" color="gray.600">
                Analyzing repository...
              </Text>
            </Box>
          )}
          {data && !isLoading && (
            <VStack gap={6} align="stretch">
              <Box bg="white" p={8} borderRadius="2xl" boxShadow="2xl">
                <HStack justify="space-between" align="start" mb={4}>
                  <Box>
                    <Heading size="3xl" mb={2} color="gray.800">
                      {data.repository.name}
                    </Heading>
                    <Text color="gray.600" fontSize="lg" mb={4}>
                      {data.repository.description ||
                        "No description available"}
                    </Text>
                    {data.repository.language && (
                      <Badge
                        colorPalette="purple"
                        variant="subtle"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {data.repository.language}
                      </Badge>
                    )}
                  </Box>
                </HStack>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
                <StatCard
                  label="Stars"
                  value={data.repository.stars?.toLocaleString() || "0"}
                  gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  icon="⭐"
                />
                <StatCard
                  label="Forks"
                  value={data.repository.forks?.toLocaleString() || "0"}
                  gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                  icon="🔱"
                />
                <StatCard
                  label="Commits (90d)"
                  value={data.activity?.commits?.length.toLocaleString() || "0"}
                  gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                  icon="📝"
                />
                <StatCard
                  label="Open Issues"
                  value={data.repository.openIssues?.toLocaleString() || "0"}
                  gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                  icon="🐛"
                />
              </SimpleGrid>

              {data.activity?.commits && data.activity.commits.length > 0 && (
                <Box bg="white" p={8} borderRadius="2xl" boxShadow="2xl">
                  <Heading size="xl" mb={4} color="gray.800">
                    📊 Recent Commits (Last 90 Days)
                  </Heading>
                  <VStack gap={3} align="stretch">
                    {data.activity.commits.slice(0, 5).map((commit: any) => (
                      <Box
                        key={commit.sha}
                        p={4}
                        bg="gray.50"
                        borderRadius="lg"
                        borderLeft="4px solid"
                        borderColor="blue.400"
                      >
                        <Text
                          fontWeight="bold"
                          color="gray.800"
                          fontSize="sm"
                          mb={1}
                        >
                          {commit.message.split("\n")[0]}
                        </Text>
                        <HStack gap={4} fontSize="xs" color="gray.600">
                          <Text>👤 {commit.author}</Text>
                          <Text>
                            📅 {new Date(commit.date).toLocaleDateString()}
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}

              {data.contributors && data.contributors.length > 0 && (
                <Box bg="white" p={8} borderRadius="2xl" boxShadow="2xl">
                  <Heading size="xl" mb={6} color="gray.800">
                    👥 Top Contributors
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                    {data.contributors.slice(0, 6).map((contributor: any) => (
                      <Box
                        key={contributor.username}
                        p={4}
                        bg="gray.50"
                        borderRadius="lg"
                        borderLeft="4px solid"
                        borderColor="purple.400"
                      >
                        <Text fontWeight="bold" color="gray.800">
                          {contributor.username}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {contributor.contributions} contributions
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}

              {data.languages && Object.keys(data.languages).length > 0 && (
                <Box bg="white" p={8} borderRadius="2xl" boxShadow="2xl">
                  <Heading size="xl" mb={6} color="gray.800">
                    💻 Languages
                  </Heading>
                  <HStack gap={3} flexWrap="wrap">
                    {Object.entries(data.languages).map(
                      ([lang, bytes]: [string, any]) => {
                        const total = Object.values(data.languages).reduce(
                          (a: number, b: any) => a + b,
                          0
                        ) as number;
                        const percentage = ((bytes / total) * 100).toFixed(1);
                        return (
                          <Badge
                            key={lang}
                            colorPalette="blue"
                            variant="solid"
                            px={4}
                            py={2}
                            borderRadius="full"
                            fontSize="md"
                          >
                            {lang} ({percentage}%)
                          </Badge>
                        );
                      }
                    )}
                  </HStack>
                </Box>
              )}
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

// Helper Components
function StatCard({
  label,
  value,
  gradient,
  icon,
}: {
  label: string;
  value: string;
  gradient: string;
  icon: string;
}) {
  return (
    <Box
      bg={gradient}
      p={6}
      borderRadius="xl"
      boxShadow="xl"
      color="white"
      transition="all 0.3s"
      _hover={{ transform: "translateY(-4px)", boxShadow: "2xl" }}
    >
      <Text fontSize="3xl" mb={2}>
        {icon}
      </Text>
      <Text fontSize="3xl" fontWeight="bold" mb={1}>
        {value}
      </Text>
      <Text fontSize="sm" opacity={0.9}>
        {label}
      </Text>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
      <Text color="gray.600" fontWeight="medium">
        {label}
      </Text>
      <Text color="gray.800" fontWeight="bold">
        {value}
      </Text>
    </HStack>
  );
}
