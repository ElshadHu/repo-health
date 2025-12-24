// OSV API utilities for vulnerability scanning

import { cacheService } from "@/lib/redis";
import type { Vulnerability, Ecosystem, OSVRawVuln } from "../../types";

const CACHE_TTL = {
  OSV: 7 * 24 * 60 * 60, // 7 days
};

function mapSeverity(raw: OSVRawVuln): Vulnerability["severity"] {
  const dbSeverity = raw?.database_specific?.severity?.toUpperCase() || "";
  if (dbSeverity === "CRITICAL") return "CRITICAL";
  if (dbSeverity === "HIGH") return "HIGH";
  if (dbSeverity === "MODERATE" || dbSeverity === "MEDIUM") return "MEDIUM";
  if (dbSeverity === "LOW") return "LOW";

  const cvssScore = raw?.severity?.[0]?.score;
  if (cvssScore !== undefined) {
    if (cvssScore >= 9.0) return "CRITICAL";
    if (cvssScore >= 7.0) return "HIGH";
    if (cvssScore >= 4.0) return "MEDIUM";
    return "LOW";
  }

  const severityType = raw?.severity?.[0]?.type?.toUpperCase() || "";
  if (severityType.includes("CRITICAL")) return "CRITICAL";
  if (severityType.includes("HIGH")) return "HIGH";
  if (severityType.includes("MEDIUM") || severityType.includes("MODERATE"))
    return "MEDIUM";

  return "LOW";
}

function parseOSVVuln(raw: OSVRawVuln): Vulnerability {
  return {
    id: raw.id,
    severity: mapSeverity(raw),
    summary: raw.summary || raw.details || "No description",
    fixedVersion: raw.affected?.[0]?.ranges?.[0]?.events?.find(
      (e: { fixed?: string }) => e.fixed
    )?.fixed,
  };
}

export async function fetchVulns(
  name: string,
  version: string,
  ecosystem: Ecosystem
): Promise<Vulnerability[]> {
  const cacheKey = `osv:${ecosystem}:${name}:${version}`;
  const cached = await cacheService.get<Vulnerability[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch("https://api.osv.dev/v1/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        package: { name, ecosystem },
        version,
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const vulns = (data.vulns || []).map(parseOSVVuln);
    await cacheService.set(cacheKey, vulns, CACHE_TTL.OSV);
    return vulns;
  } catch {
    return [];
  }
}
