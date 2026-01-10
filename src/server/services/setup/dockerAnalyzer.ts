// detects required services

import type { CriticalIssue, SetupFilesResult } from "../../types/setup";

// Parse docker-compose.yml to extract services
function parseDockerCompose(content: string): string[] {
  const services: string[] = [];

  // Match services section and extract service names
  const servicesMatch = content.match(
    /services:\s*\n([\s\S]*?)(?=\n\w|\n---|\Z)/
  );
  if (servicesMatch) {
    const serviceLines = servicesMatch[1].match(/^\s{2}(\w+):/gm) || [];
    services.push(...serviceLines.map((s) => s.trim().replace(":", "")));
  }

  return services;
}

// Detect common services like databases, caches
function categorizeServices(services: string[]): {
  databases: string[];
  caches: string[];
  other: string[];
} {
  const databases: string[] = [];
  const caches: string[] = [];
  const other: string[] = [];

  const dbKeywords = [
    "mysql",
    "postgres",
    "mongodb",
    "mariadb",
    "db",
    "database",
  ];
  const cacheKeywords = ["redis", "memcached", "cache"];

  for (const service of services) {
    const lower = service.toLowerCase();
    if (dbKeywords.some((kw) => lower.includes(kw))) {
      databases.push(service);
    } else if (cacheKeywords.some((kw) => lower.includes(kw))) {
      caches.push(service);
    } else {
      other.push(service);
    }
  }

  return { databases, caches, other };
}

export function analyzeDocker(files: SetupFilesResult): CriticalIssue[] {
  const issues: CriticalIssue[] = [];

  if (!files.dockerCompose) return issues;

  const services = parseDockerCompose(files.dockerCompose);
  const { databases, caches } = categorizeServices(services);

  if (services.length > 0) {
    issues.push({
      id: "docker-services",
      type: "environment",
      severity: "critical",
      title: `${services.length} Docker services required`,
      description: `Services: ${services.slice(0, 4).join(", ")}${services.length > 4 ? `, +${services.length - 4} more` : ""}`,
      solution: {
        command: "docker-compose up -d",
      },
    });
  }

  if (databases.length > 0) {
    issues.push({
      id: "docker-db",
      type: "environment",
      severity: "warning",
      title: `Database required: ${databases.join(", ")}`,
      description: "Make sure database is running before starting the app",
      solution: {
        command: "docker-compose up -d " + databases.join(" "),
      },
    });
  }

  if (caches.length > 0) {
    issues.push({
      id: "docker-cache",
      type: "environment",
      severity: "info",
      title: `Cache service: ${caches.join(", ")}`,
      description: "Cache service is optional for local development",
      solution: {
        command: "docker-compose up -d " + caches.join(" "),
      },
    });
  }

  return issues;
}

export function getDockerQuickStartCommands(files: SetupFilesResult): string[] {
  const commands: string[] = [];

  if (files.dockerCompose) {
    commands.push("docker-compose up -d");
  }

  return commands;
}

export function getDockerSetupSteps(files: SetupFilesResult): string[] {
  const steps: string[] = [];
  const issues = analyzeDocker(files);

  // Docker services
  const dockerCritical = issues.find((i) => i.severity === "critical");
  const dockerDb = issues.find((i) => i.id === "docker-db");

  if (dockerCritical) {
    steps.push(`Start Docker services (${dockerCritical.description})`);
  } else if (dockerDb) {
    steps.push("Start database services with Docker");
  }

  return steps;
}
