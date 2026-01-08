"use client";
import { Container, VStack, Text } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { SetupInsightsPanel } from "@/components/setup/SetupInsightsPanel";

export default function SetupDetailPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  if (!owner || !repo) {
    return (
      <Container maxW="container.xl" pt={8}>
        <Text color="#8b949e">Repository not specified</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" pt={8} pb={12}>
      <VStack align="stretch" gap={6}>
        <Text color="#8b949e" fontSize="sm">
          {owner}/{repo}
        </Text>
        <SetupInsightsPanel owner={owner} repo={repo} />
      </VStack>
    </Container>
  );
}
