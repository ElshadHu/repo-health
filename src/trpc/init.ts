import { initTRPC } from "@trpc/server";
import superjson from "superjson";
// Context: shared resources available to all procedures
export const createTRPCContext = async () => {
  return {};
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Initialize tRPC with superjson for handling date,map,set serielization
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Export these to build routers and procedures
export const router = t.router;
export const publicProcedure = t.procedure;
