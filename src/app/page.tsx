"use client";

import { useState, useEffect, Suspense } from "react";
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
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { RepositoryCard } from "@/components/cards/RepositoryCard";
import { CommitListCard } from "@/components/cards/CommitListCard";
import { ContributorCard } from "@/components/cards/ContributorCard";
import { DependencySummaryCard } from "@/components/cards/DependencySummaryCard";
import { PRStatsCard } from "@/components/cards/PRStatsCard";
import { IssueStatsCard } from "@/components/cards/IssueStatsCard";
import { ActivityCard } from "@/components/anomaly/ActivityCard";
import { ProjectOverviewSection } from "@/components/overview";
import { PitfallsSummaryCard } from "@/components/contributor/PitfallsSummaryCard";
import { useSearchParams, useRouter } from "next/navigation";

const toaster = createToaster({
  placement: "bottom",
  duration: 5000,
  max: 2,
});

function HomePageContent() {
  const { status } = useSession();
  const searchParamsUrl = useSearchParams();
  const router = useRouter();

  // Initialize state from URL params  for avoiding useEffect + setState problem
  const initialOwner = searchParamsUrl.get("owner");
  const initialRepo = searchParamsUrl.get("repo");
  const initialSearchParams =
    initialOwner && initialRepo
      ? { owner: initialOwner, repo: initialRepo }
      : null;

  const [searchParams, setSearchParams] = useState<{
    owner: string;
    repo: string;
  } | null>(initialSearchParams);
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

  const { data: prStats } = trpc.pr.getStats.useQuery(searchParams!, {
    enabled: searchParams !== null,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const { data: dependencies, isLoading: isDepsLoading } =
    trpc.dependency.analyze.useQuery(searchParams!, {
      enabled: searchParams !== null,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 min client cache
    });

  const { data: pitfalls } = trpc.contributor.getPitfalls.useQuery(
    searchParams!,
    {
      enabled: searchParams !== null && !!data,
      retry: false,
      staleTime: 1000 * 60 * 5,
    }
  );

  const { data: fundingInfo } = trpc.funding.getFunding.useQuery(
    searchParams!,
    {
      enabled: searchParams !== null,
      retry: false,
      staleTime: 1000 * 60 * 10,
    }
  );

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

  // Save search after being sure if repo is private
  useEffect(() => {
    if (data && searchParams && isSignedIn) {
      saveSearchMutation.mutate({
        owner: searchParams.owner,
        repo: searchParams.repo,
        isPrivate: data.repository.isPrivate ?? false,
      });
    }
    // Record rate limit only after successful search for anonymous users
    if (data && searchParams && !isSignedIn) {
      recordSearchMutation.mutate();
    }
  }, [data, searchParams, isSignedIn]);

  const recordSearchMutation = trpc.rateLimit.recordSearch.useMutation();
  const utils = trpc.useUtils();

  const handleSearch = async (owner: string, repo: string) => {
    // Check rate limit for anonymous users
    if (status !== "authenticated") {
      try {
        const rateLimitCheck = await utils.rateLimit.checkLimit.fetch();
        if (!rateLimitCheck.allowed) {
          const minutes = Math.ceil(
            (rateLimitCheck.retryAfterSeconds || 0) / 60
          );
          toaster.create({
            title: "Free search used",
            description: `One more step! Sign in with GitHub to keep searching, or come back in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
            type: "info",
            action: {
              label: "Sign in",
              onClick: () => signIn("github"),
            },
          });
          return;
        }
      } catch (error) {
        // If rate limit check fails, allow the search
        console.error("Rate limit check failed:", error);
      }
    }

    setSearchParams({ owner, repo });
    setSearchAttempt((prev) => prev + 1);
    router.push(`/?owner=${owner}&repo=${repo}`, { scroll: false });
  };

  return (
    <Box bg="#0d1117" minH="100vh" py={12}>
      <Container maxW="container.xl">
        <VStack gap={10} align="stretch">
          <PageHeader />

          <Flex
            bg="#161b22"
            border="1px solid #30363d"
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
                stats={{
                  stars: data.repository.stars || 0,
                  forks: data.repository.forks || 0,
                  commits: data.activity?.commits?.length || 0,
                  openIssues: data.repository.openIssues || 0,
                }}
                languages={data.languages}
                fundingLinks={fundingInfo?.links}
              />

              {/* Project Overview - Full Width Section */}
              {searchParams && (
                <ProjectOverviewSection
                  owner={searchParams.owner}
                  repo={searchParams.repo}
                />
              )}

              {/* Main Feature Cards - Uniform Grid */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {isDepsLoading ? (
                  <Box
                    bg="#161b22"
                    border="1px solid #30363d"
                    p={6}
                    borderRadius="lg"
                    textAlign="center"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    minH="200px"
                  >
                    <Text color="#8b949e">Scanning dependencies...</Text>
                  </Box>
                ) : (
                  dependencies &&
                  searchParams && (
                    <DependencySummaryCard
                      summary={dependencies.summary}
                      owner={searchParams.owner}
                      repo={searchParams.repo}
                    />
                  )
                )}

                {prStats && searchParams && (
                  <PRStatsCard
                    stats={prStats}
                    owner={searchParams.owner}
                    repo={searchParams.repo}
                  />
                )}
                {searchParams && (
                  <IssueStatsCard
                    openIssues={data.repository.openIssues || 0}
                    owner={searchParams.owner}
                    repo={searchParams.repo}
                  />
                )}
                {searchParams && (
                  <ActivityCard
                    owner={searchParams.owner}
                    repo={searchParams.repo}
                  />
                )}
                {pitfalls && searchParams && (
                  <PitfallsSummaryCard
                    analyzedCount={pitfalls.analyzedCount}
                    topCategories={Object.entries(
                      pitfalls.analyses.reduce(
                        (acc: Record<string, number>, item) => {
                          acc[item.category] = (acc[item.category] || 0) + 1;
                          return acc;
                        },
                        {}
                      )
                    )
                      .map(([category, count]) => ({ category, count }))
                      .sort((a, b) => b.count - a.count)}
                    topPattern={pitfalls.patterns[0] || null}
                    owner={searchParams.owner}
                    repo={searchParams.repo}
                  />
                )}
              </SimpleGrid>

              {data.activity?.commits && data.activity.commits.length > 0 && (
                <CommitListCard commits={data.activity.commits} />
              )}

              {data.contributors && data.contributors.length > 0 && (
                <ContributorCard contributors={data.contributors} />
              )}
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <HomePageContent />
    </Suspense>
  );
}
