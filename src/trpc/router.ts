import { router } from "./init";
import { repoRouter } from "../server/routers/repoRouter";
import { healthRouter } from "../server/routers/healthRouter";
import { dependencyRouter } from "../server/routers/dependencyRouter";
import { prRouter } from "../server/routers/prRouter";

export const appRouter = router({
  repo: repoRouter,
  health: healthRouter,
  dependency: dependencyRouter,
  pr: prRouter,
});

export type AppRouter = typeof appRouter;
