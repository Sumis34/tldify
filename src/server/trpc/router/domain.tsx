import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import dns from "dns";

function hostnameExists(hostname: string) {
  return new Promise((resolve) => {
    dns.lookup(hostname, (error) => resolve({ hostname, exists: !error }));
  });
}

export const domainRouter = router({
  exists: publicProcedure
    .input(z.object({ domains: z.array(z.string().max(63)) }))
    .mutation(({ input }) => {
      const { domains } = input;

      Promise.all(domains.map(hostnameExists)).then((listOfStatuses) => {
        // check results here
        console.log(listOfStatuses);
      });

      return {
        exists: true,
      };
    }),
});
