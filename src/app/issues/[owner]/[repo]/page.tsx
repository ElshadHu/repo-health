"use client";

import { useParams } from "next/navigation";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import { trpc } from "@/trpc/client";
import { IssueDetailsPage } from "@/components/issues/IssueDetailsPage";

export default function IssuesPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const { data, isLoading, error } = trpc.issue.analyze.useQuery({
    owner,
    repo,
  });

  if (isLoading) {
    return (
      <Box
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap={4}>
          <Spinner size="xl" color="#58a6ff" />
          <Text color="#8b949e">Analyzing issues...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="#f85149">Error: {error.message}</Text>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="#8b949e">No issue data found</Text>
      </Box>
    );
  }

  return <IssueDetailsPage stats={data} owner={owner} repo={repo} />;
}
