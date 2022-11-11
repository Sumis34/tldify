import { router } from "../trpc";
import { domainRouter } from "./domain";
import { exampleRouter } from "./example";

export const appRouter = router({
  example: exampleRouter,
  domain: domainRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
