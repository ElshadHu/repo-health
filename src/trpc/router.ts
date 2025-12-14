import { router } from "./init";
import { githubRouter } from "../server/routers/githubRouter";
export const appRouter = router({
  github: githubRouter,
});
export type AppRouter = typeof appRouter;
