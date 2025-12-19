import { router } from "../../trpc/init";
import { repoRouter } from "./repoRouter";
import { healthRouter } from "./healthRouter";
import { dependencyRouter } from "./dependencyRouter";

export const appRouter = router({
  repo: repoRouter,
  health: healthRouter,
  dependency: dependencyRouter,
});

export type AppRouter = typeof appRouter;
