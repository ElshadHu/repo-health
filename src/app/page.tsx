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
  createToaster,
  Toaster,
} from "@chakra-ui/react";
import { useSession, signIn } from "next-auth/react";
import { trpc } from "@/trpc/client";
import { RepoSearchInput } from "@/components/repoInput";
import { StatCard } from "@/components/cards/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { RepositoryCard } from "@/components/cards/RepositoryCard";

const toaster = createToaster({
  placement: "bottom",
  duration: 5000,
  max: 2,
});

export default function HomePage() {
  const { status } = useSession();
  const [searchParams, setSearchParams] = useState<{
    owner: string;
    repo: string;
  } | null>(null);
  const [searchAttempt, setSearchAttempt] = useState(0);

  const { data, isLoading, error } = trpc.github.getCompleteAnalysis.useQuery(
    searchParams!,
    {
      enabled: searchParams !== null,
      retry: false,
      staleTime: 0,
    }
  );

  useEffect(() => {
    if (error && searchAttempt > 0) {
      // Use setTimeout to avoid flushSync error
      setTimeout(() => {
        const isNotAuthenticated = status === "unauthenticated";
        const errorMessage = isNotAuthenticated
          ? "Repository not found. It might be private - sign in to access private repositories."
          : "Repository not found or you don't have access to it.";

        toaster.create({
          title: "Error",
          description: errorMessage,
          type: "error",
          action: isNotAuthenticated
            ? {
                label: "Sign in",
                onClick: () => signIn("github"),
              }
            : undefined,
        });
      }, 0);
    }
  }, [searchAttempt, error, status]);

  const handleSearch = (owner: string, repo: string) => {
    setSearchParams({ owner, repo });
    setSearchAttempt((prev) => prev + 1);
  };

  return (
    <Box bg="#0d1117" minH="100vh" py={12}>
      <Container maxW="container.xl">
        <VStack gap={10} align="stretch">
          <PageHeader />

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

          {isLoading && <LoadingState />}
          {data && !isLoading && (
            <VStack gap={6} align="stretch">
              <RepositoryCard
                name={data.repository.name}
                description={data.repository.description}
                language={data.repository.language}
              />

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
                <StatCard
                  label="Stars"
                  value={data.repository.stars?.toLocaleString() || "0"}
                  icon="⭐"
                />
                <StatCard
                  label="Forks"
                  value={data.repository.forks?.toLocaleString() || "0"}
                  icon="🔱"
                />
                <StatCard
                  label="Commits (90d)"
                  value={data.activity?.commits?.length.toLocaleString() || "0"}
                  icon="📝"
                />
                <StatCard
                  label="Open Issues"
                  value={data.repository.openIssues?.toLocaleString() || "0"}
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
