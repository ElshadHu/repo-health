import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/trpc/router";
import { createTRPCContext } from "@/trpc/init";

// Extract client IP from request headers
function getClientIp(req: Request): string {
  // use x-forwarded-for
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Can be comma-separated list, take first one
    return forwarded.split(",")[0].trim();
  }
  // fallback headers
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ clientIp: getClientIp(req) }),
  });

export { handler as GET, handler as POST };
