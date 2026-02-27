import { createServerFn } from "@tanstack/react-start";
import { ensureUserMiddleware } from "@/middleware/ensureUser";
import { useSessionTokenClientMiddleware } from "@every-app/sdk/tanstack";
import {
  startAuditSchema,
  getAuditStatusSchema,
  getAuditResultsSchema,
  getAuditHistorySchema,
  deleteAuditSchema,
  getCrawlProgressSchema,
} from "@/types/schemas/audit";
import { AuditService } from "@/server/services/AuditService";
import { logServerError } from "@/server/lib/logger";
import { toClientError } from "@/server/lib/errors";

export const startAudit = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => startAuditSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await AuditService.startAudit({
        userId: context.userId,
        projectId: data.projectId,
        startUrl: data.startUrl,
        maxPages: data.maxPages,
        psiStrategy: data.psiStrategy,
        psiApiKey: data.psiApiKey,
      });
    } catch (error) {
      logServerError("audit.start", error, {
        userId: context.userId,
        projectId: data.projectId,
      });
      throw toClientError(error);
    }
  });

export const getAuditStatus = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => getAuditStatusSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await AuditService.getStatus(data.auditId, context.userId);
    } catch (error) {
      logServerError("audit.status", error, {
        userId: context.userId,
        auditId: data.auditId,
      });
      throw toClientError(error);
    }
  });

export const getAuditResults = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => getAuditResultsSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await AuditService.getResults(data.auditId, context.userId);
    } catch (error) {
      logServerError("audit.results", error, {
        userId: context.userId,
        auditId: data.auditId,
      });
      throw toClientError(error);
    }
  });

export const getAuditHistory = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => getAuditHistorySchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await AuditService.getHistory(data.projectId, context.userId);
    } catch (error) {
      logServerError("audit.history", error, {
        userId: context.userId,
        projectId: data.projectId,
      });
      throw toClientError(error);
    }
  });

export const getCrawlProgress = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => getCrawlProgressSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await AuditService.getCrawlProgress(data.auditId, context.userId);
    } catch (error) {
      logServerError("audit.crawl-progress", error, {
        userId: context.userId,
        auditId: data.auditId,
      });
      throw toClientError(error);
    }
  });

export const deleteAudit = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => deleteAuditSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      await AuditService.remove(data.auditId, context.userId);
      return { success: true };
    } catch (error) {
      logServerError("audit.delete", error, {
        userId: context.userId,
        auditId: data.auditId,
      });
      throw toClientError(error);
    }
  });
