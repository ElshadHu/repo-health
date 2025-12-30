import { router } from "./init";
import { repoRouter } from "../server/routers/repoRouter";
import { healthRouter } from "../server/routers/healthRouter";
import { dependencyRouter } from "../server/routers/dependencyRouter";
import { prRouter } from "../server/routers/prRouter";
import { userRouter } from "../server/routers/userRouter";
import { issueRouter } from "../server/routers/issueRouter";
import { anomalyRouter } from "../server/routers/anomalyRouter";
import { overviewRouter } from "../server/routers/overviewRouter";
import { contributorRouter } from "../server/routers/contributorRouter";
import { fundingRouter } from "../server/routers/fundingRouter";

export const appRouter = router({
  repo: repoRouter,
  health: healthRouter,
  dependency: dependencyRouter,
  pr: prRouter,
  user: userRouter,
  issue: issueRouter,
  anomaly: anomalyRouter,
  overview: overviewRouter,
  contributor: contributorRouter,
  funding: fundingRouter,
});

export type AppRouter = typeof appRouter;
