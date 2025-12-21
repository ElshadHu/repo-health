import { router } from "./init";
import { repoRouter } from "../server/routers/repoRouter";
import { healthRouter } from "../server/routers/healthRouter";
import { dependencyRouter } from "../server/routers/dependencyRouter";
import { prRouter } from "../server/routers/prRouter";
import { userRouter } from "../server/routers/userRouter";
import { issueRouter } from "../server/routers/issueRouter";

export const appRouter = router({
  repo: repoRouter,
  health: healthRouter,
  dependency: dependencyRouter,
  pr: prRouter,
  user: userRouter,
  issue: issueRouter,
});

export type AppRouter = typeof appRouter;
