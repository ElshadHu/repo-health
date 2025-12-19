"use client";

import { useParams } from "next/navigation";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Badge,
  Flex,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaGithub,
} from "react-icons/fa";
import Link from "next/link";
import { trpc } from "@/trpc/client";

const SEVERITY_CONFIG = {
  CRITICAL: { bg: "#f85149", color: "white", label: "Critical" },
  HIGH: { bg: "#db6d28", color: "white", label: "High" },
  MEDIUM: { bg: "#d29922", color: "white", label: "Moderate" },
  LOW: { bg: "#238636", color: "white", label: "Low" },
};

function SeverityBadge({ severity }: { severity: string }) {
  const config =
    SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG] ||
    SEVERITY_CONFIG.LOW;
  return (
    <Badge bg={config.bg} color={config.color} px={2} py={1} borderRadius="md">
      {config.label}
    </Badge>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Box
      bg="#21262d"
      border="1px solid #30363d"
      borderRadius="lg"
      p={4}
      textAlign="center"
      transition="all 0.2s ease"
      _hover={{ borderColor: color }}
    >
      <Text fontSize="3xl" fontWeight="bold" color={color}>
        {value}
      </Text>
      <Text fontSize="sm" color="#8b949e">
        {label}
      </Text>
    </Box>
  );
}

function VulnerabilityCard({
  vuln,
  packageName,
  packageVersion,
  owner,
  repo,
}: {
  vuln: {
    id: string;
    severity: string;
    summary: string;
    fixedVersion?: string;
  };
  packageName: string;
  packageVersion: string;
  owner: string;
  repo: string;
}) {
  const newIssueUrl = `https://github.com/${owner}/${repo}/issues/new?title=${encodeURIComponent(
    `Security: ${packageName} vulnerability (${vuln.id})`
  )}&body=${encodeURIComponent(
    `## Vulnerability Details\n\n- **Package:** ${packageName}@${packageVersion}\n- **ID:** ${vuln.id}\n- **Severity:** ${vuln.severity}\n- **Summary:** ${vuln.summary}\n${vuln.fixedVersion ? `- **Fix:** Upgrade to ${vuln.fixedVersion}+` : ""}\n\n## References\n- https://osv.dev/vulnerability/${vuln.id}`
  )}`;

  const osvUrl = `https://osv.dev/vulnerability/${vuln.id}`;
  const searchPRsUrl = `https://github.com/search?q=${encodeURIComponent(
    `${vuln.id} is:pr is:merged`
  )}&type=pullrequests`;

  return (
    <Box
      bg="#161b22"
      border="1px solid #30363d"
      borderRadius="lg"
      p={5}
      transition="all 0.2s ease"
      _hover={{
        borderColor:
          SEVERITY_CONFIG[vuln.severity as keyof typeof SEVERITY_CONFIG]?.bg ||
          "#30363d",
      }}
    >
      {/* Header */}
      <Flex justify="space-between" align="start" mb={3}>
        <VStack align="start" gap={1}>
          <HStack gap={2}>
            <SeverityBadge severity={vuln.severity} />
            <Text fontSize="sm" color="#8b949e" fontFamily="mono">
              {vuln.id}
            </Text>
          </HStack>
          <Text fontSize="md" fontWeight="bold" color="#c9d1d9">
            {packageName}@{packageVersion}
          </Text>
        </VStack>
      </Flex>

      {/* Summary */}
      <Text fontSize="sm" color="#8b949e" mb={4}>
        {vuln.summary}
      </Text>

      {/* Fix Version */}
      {vuln.fixedVersion && (
        <Box
          bg="rgba(35,134,54,0.15)"
          border="1px solid rgba(35,134,54,0.3)"
          borderRadius="md"
          p={3}
          mb={4}
        >
          <HStack gap={2}>
            <FaCheckCircle color="#238636" />
            <Text fontSize="sm" color="#238636">
              Fix available: Upgrade to <strong>{vuln.fixedVersion}</strong>+
            </Text>
          </HStack>
        </Box>
      )}

      {/* Actions */}
      <HStack gap={2} flexWrap="wrap">
        <a href={osvUrl} target="_blank" rel="noopener noreferrer">
          <Button
            size="sm"
            variant="outline"
            borderColor="#30363d"
            color="#c9d1d9"
            _hover={{ bg: "#21262d", borderColor: "#8b949e" }}
          >
            <FaExternalLinkAlt />
            <Text ml={2}>Details</Text>
          </Button>
        </a>
        <a href={searchPRsUrl} target="_blank" rel="noopener noreferrer">
          <Button
            size="sm"
            variant="outline"
            borderColor="#30363d"
            color="#c9d1d9"
            _hover={{ bg: "#21262d", borderColor: "#8b949e" }}
          >
            <FaGithub />
            <Text ml={2}>Search PRs</Text>
          </Button>
        </a>
        <a href={newIssueUrl} target="_blank" rel="noopener noreferrer">
          <Button
            size="sm"
            bg="#238636"
            color="white"
            _hover={{ bg: "#2ea043" }}
          >
            Open Issue
          </Button>
        </a>
      </HStack>
    </Box>
  );
}

export default function DependencyDashboard() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const { data, isLoading, error } = trpc.dependency.analyze.useQuery(
    { owner, repo },
    { staleTime: 1000 * 60 * 5 }
  );

  if (isLoading) {
    return (
      <Box bg="#0d1117" minH="100vh" py={12}>
        <Container maxW="container.xl">
          <VStack gap={8}>
            <Text color="#8b949e" fontSize="lg">
              Scanning dependencies for {owner}/{repo}...
            </Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box bg="#0d1117" minH="100vh" py={12}>
        <Container maxW="container.xl">
          <VStack gap={8}>
            <Text color="#f85149" fontSize="lg">
              Error loading dependencies
            </Text>
            <Link href="/">
              <Button variant="outline" borderColor="#30363d" color="#c9d1d9">
                <FaArrowLeft />
                <Text ml={2}>Back to Home</Text>
              </Button>
            </Link>
          </VStack>
        </Container>
      </Box>
    );
  }

  const allVulnerabilities = [
    ...data.dependencies,
    ...data.devDependencies,
  ].flatMap((dep) =>
    dep.vulnerabilities.map((v) => ({
      ...v,
      packageName: dep.name,
      packageVersion: dep.version,
    }))
  );

  const hasVulnerabilities = allVulnerabilities.length > 0;

  return (
    <Box bg="#0d1117" minH="100vh" py={12}>
      <Container maxW="container.xl">
        <VStack gap={8} align="stretch">
          {/* Back Button */}
          <Link href="/" style={{ width: "fit-content" }}>
            <Button
              variant="ghost"
              color="#8b949e"
              _hover={{ color: "#c9d1d9", bg: "#21262d" }}
              size="sm"
            >
              <FaArrowLeft />
              <Text ml={2}>Back to Analysis</Text>
            </Button>
          </Link>

          {/* Header */}
          <Box>
            <Text fontSize="3xl" fontWeight="bold" color="#c9d1d9">
              Dependency Analysis
            </Text>
            <Text fontSize="lg" color="#8b949e">
              {owner}/{repo}
            </Text>
          </Box>

          {/* Summary Stats */}
          <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} gap={4}>
            <SummaryCard
              label="Total Packages"
              value={data.summary.total}
              color="#c9d1d9"
            />
            <SummaryCard
              label="Vulnerabilities"
              value={data.summary.vulnerable}
              color={hasVulnerabilities ? "#f85149" : "#238636"}
            />
            <SummaryCard
              label="Critical"
              value={data.summary.critical}
              color="#f85149"
            />
            <SummaryCard
              label="High"
              value={data.summary.high}
              color="#db6d28"
            />
            <SummaryCard
              label="Moderate"
              value={data.summary.moderate}
              color="#d29922"
            />
            <SummaryCard label="Low" value={data.summary.low} color="#238636" />
          </SimpleGrid>

          {/* Action Hint */}
          {hasVulnerabilities && (
            <Box
              bg="rgba(248,81,73,0.1)"
              border="1px solid rgba(248,81,73,0.3)"
              borderRadius="lg"
              p={4}
            >
              <HStack gap={3}>
                <FaExclamationTriangle color="#f85149" size={20} />
                <VStack align="start" gap={0}>
                  <Text color="#f85149" fontWeight="bold">
                    Vulnerabilities Detected
                  </Text>
                  <Text color="#8b949e" fontSize="sm">
                    Review vulnerabilities below. Click "Search PRs" to see how
                    other projects fixed similar issues, or "Open Issue" to
                    start a discussion.
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}

          {/* Vulnerabilities List */}
          {hasVulnerabilities ? (
            <VStack align="stretch" gap={4}>
              <Text fontSize="xl" fontWeight="bold" color="#c9d1d9">
                Vulnerabilities ({allVulnerabilities.length})
              </Text>
              {allVulnerabilities.map((vuln, idx) => (
                <VulnerabilityCard
                  key={`${vuln.id}-${idx}`}
                  vuln={vuln}
                  packageName={vuln.packageName}
                  packageVersion={vuln.packageVersion}
                  owner={owner}
                  repo={repo}
                />
              ))}
            </VStack>
          ) : (
            <Box
              bg="#161b22"
              border="1px solid #238636"
              borderRadius="lg"
              p={8}
              textAlign="center"
            >
              <VStack gap={3}>
                <FaCheckCircle color="#238636" size={48} />
                <Text fontSize="xl" fontWeight="bold" color="#238636">
                  All Clear!
                </Text>
                <Text color="#8b949e">
                  No known vulnerabilities found in your dependencies.
                </Text>
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
