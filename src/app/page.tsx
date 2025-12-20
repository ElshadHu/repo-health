"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  SimpleGrid,
  Text,
  createToaster,
  Toaster,
  Flex,
} from "@chakra-ui/react";
import { useSession, signIn } from "next-auth/react";
import { trpc } from "@/trpc/client";
import { RepoSearchInput } from "@/components/repoInput";
import { RecentSearches } from "@/components/RecentSearches";
import { StatCard } from "@/components/cards/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { RepositoryCard } from "@/components/cards/RepositoryCard";
import { CommitListCard } from "@/components/cards/CommitListCard";
import { ContributorCard } from "@/components/cards/ContributorCard";
import { LanguageCard } from "@/components/cards/LanguageCard";
import { HealthScoreCircle } from "@/components/cards/HealthScoreCircle";
import { DependencySummaryCard } from "@/components/cards/DependencySummaryCard";
import { PRStatsCard } from "@/components/cards/PRStatsCard";

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

  const { data, isLoading, error } = trpc.repo.getCompleteAnalysis.useQuery(
    searchParams!,
    {
      enabled: searchParams !== null,
      retry: false,
      staleTime: 0,
    }
  );

  const isSignedIn = status === "authenticated";
  const { data: recentSearches, isLoading: isRecentLoading } =
    trpc.user.getRecentSearches.useQuery(undefined, {
      enabled: isSignedIn,
      staleTime: 1000 * 60,
    });

  const saveSearchMutation = trpc.user.saveSearch.useMutation();

  const { data: healthScore, isLoading: isHealthLoading } =
    trpc.health.getScore.useQuery(searchParams!, {
      enabled: searchParams !== null,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 min client cache
    });
  const { data: prStats, isLoading: isPRLoading } = trpc.pr.getStats.useQuery(
    searchParams!,
    { enabled: searchParams !== null, retry: false, staleTime: 1000 * 60 * 5 }
  );

  const { data: dependencies, isLoading: isDepsLoading } =
    trpc.dependency.analyze.useQuery(searchParams!, {
      enabled: searchParams !== null,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 min client cache
    });

  useEffect(() => {
    if (error && searchAttempt > 0) {
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

    if (isSignedIn) {
      saveSearchMutation.mutate({ owner, repo });
    }
  };

  return (
    <Box bg="#0d1117" minH="100vh" py={12}>
      <Container maxW="container.xl">
        <VStack gap={10} align="stretch">
          <PageHeader />

          <Flex
            bg="white"
            p={8}
            borderRadius="2xl"
            boxShadow="2xl"
            gap={6}
            direction={{ base: "column", md: "row" }}
          >
            {/* Search Input - 60% width on desktop */}
            <Box flex={{ base: "1", md: "0.6" }}>
              <RepoSearchInput onSearch={handleSearch} isLoading={isLoading} />
            </Box>

            {/* Recent Searches - 40% width on desktop */}
            {isSignedIn && (
              <Box
                flex={{ base: "1", md: "0.4" }}
                borderLeft={{ base: "none", md: "1px solid" }}
                borderTop={{ base: "1px solid", md: "none" }}
                borderColor="gray.200"
                pt={{ base: 4, md: 0 }}
                pl={{ base: 0, md: 6 }}
              >
                <RecentSearches
                  searches={recentSearches || []}
                  onSelect={handleSearch}
                  isLoading={isRecentLoading}
                />
              </Box>
            )}
          </Flex>

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

              {isHealthLoading ? (
                <Box
                  bg="#161b22"
                  border="1px solid #30363d"
                  p={6}
                  borderRadius="lg"
                  textAlign="center"
                >
                  <Text color="#8b949e">Loading health score...</Text>
                </Box>
              ) : (
                healthScore && (
                  <Box
                    bg="#161b22"
                    border="1px solid #30363d"
                    p={6}
                    borderRadius="lg"
                  >
                    <HealthScoreCircle
                      score={healthScore.overallScore}
                      breakdown={healthScore.breakdown}
                    />
                  </Box>
                )
              )}
              {isDepsLoading ? (
                <Box
                  bg="#161b22"
                  border="1px solid #30363d"
                  p={6}
                  borderRadius="lg"
                  textAlign="center"
                >
                  <Text color="#8b949e">Scanning dependencies...</Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                  {dependencies && searchParams && (
                    <DependencySummaryCard
                      summary={dependencies.summary}
                      owner={searchParams.owner}
                      repo={searchParams.repo}
                    />
                  )}
                  {prStats && searchParams && (
                    <PRStatsCard
                      stats={prStats}
                      owner={searchParams.owner}
                      repo={searchParams.repo}
                    />
                  )}
                </SimpleGrid>
              )}

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
                <CommitListCard commits={data.activity.commits} />
              )}

              {data.contributors && data.contributors.length > 0 && (
                <ContributorCard contributors={data.contributors} />
              )}

              {data.languages && Object.keys(data.languages).length > 0 && (
                <LanguageCard languages={data.languages} />
              )}
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
