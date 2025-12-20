import { router } from "../../trpc/init";
import { repoRouter } from "./repoRouter";
import { healthRouter } from "./healthRouter";
import { dependencyRouter } from "./dependencyRouter";
import { prRouter } from "./prRouter";

export const appRouter = router({
  repo: repoRouter,
  health: healthRouter,
  dependency: dependencyRouter,
  pr: prRouter,
});

export type AppRouter = typeof appRouter;
