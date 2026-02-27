import { createServerFn } from "@tanstack/react-start";
import { ensureUserMiddleware } from "@/middleware/ensureUser";
import { useSessionTokenClientMiddleware } from "@every-app/sdk/tanstack";
import { domainOverviewSchema } from "@/types/schemas/domain";
import { DomainService } from "@/server/services/DomainService";
import { logServerError } from "@/server/lib/logger";
import { toClientError } from "@/server/lib/errors";

export const getDomainOverview = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => domainOverviewSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await DomainService.getOverview(data);
    } catch (error) {
      logServerError("domain.overview", error, {
        userId: context.userId,
        domain: data.domain,
      });
      throw toClientError(error);
    }
  });
