import { router } from "../../trpc/init";
import { repoRouter } from "./repoRouter";
import { healthRouter } from "./healthRouter";
import { dependencyRouter } from "./dependencyRouter";
import { prRouter } from "./prRouter";
import { userRouter } from "./userRouter";

export const appRouter = router({
  repo: repoRouter,
  health: healthRouter,
  dependency: dependencyRouter,
  pr: prRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
