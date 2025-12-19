import { router } from "./init";
import { repoRouter } from "../server/routers/repoRouter";
import { healthRouter } from "../server/routers/healthRouter";
import { dependencyRouter } from "../server/routers/dependencyRouter";

export const appRouter = router({
  repo: repoRouter,
  health: healthRouter,
  dependency: dependencyRouter,
});

export type AppRouter = typeof appRouter;
