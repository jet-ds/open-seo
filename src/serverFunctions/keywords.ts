import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ensureUserMiddleware } from "@/middleware/ensureUser";
import { useSessionTokenClientMiddleware } from "@every-app/sdk/tanstack";
import {
  researchKeywordsSchema,
  createProjectSchema,
  deleteProjectSchema,
  saveKeywordsSchema,
  getSavedKeywordsSchema,
  removeSavedKeywordSchema,
  serpAnalysisSchema,
} from "@/types/schemas/keywords";
import { KeywordResearchService } from "@/server/services/KeywordResearchService";
import { logServerError } from "@/server/lib/logger";
import { toClientError } from "@/server/lib/errors";

export const researchKeywords = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => researchKeywordsSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await KeywordResearchService.research(context.userId, data);
    } catch (error) {
      logServerError("keywords.research", error, { userId: context.userId });
      throw toClientError(error);
    }
  });

export const listProjects = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .handler(async ({ context }) => {
    try {
      return await KeywordResearchService.listProjects(context.userId);
    } catch (error) {
      logServerError("projects.list", error, { userId: context.userId });
      throw toClientError(error);
    }
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => createProjectSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await KeywordResearchService.createProject(context.userId, data);
    } catch (error) {
      logServerError("projects.create", error, { userId: context.userId });
      throw toClientError(error);
    }
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => deleteProjectSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await KeywordResearchService.deleteProject(context.userId, data);
    } catch (error) {
      logServerError("projects.delete", error, {
        userId: context.userId,
        projectId: data.projectId,
      });
      throw toClientError(error);
    }
  });
export const saveKeywords = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => saveKeywordsSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await KeywordResearchService.saveKeywords(context.userId, data);
    } catch (error) {
      logServerError("keywords.save", error, {
        userId: context.userId,
        projectId: data.projectId,
      });
      throw toClientError(error);
    }
  });

export const getSavedKeywords = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => getSavedKeywordsSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await KeywordResearchService.getSavedKeywords(
        context.userId,
        data,
      );
    } catch (error) {
      logServerError("keywords.saved.list", error, {
        userId: context.userId,
        projectId: data.projectId,
      });
      throw toClientError(error);
    }
  });

export const removeSavedKeyword = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => removeSavedKeywordSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await KeywordResearchService.removeSavedKeyword(
        context.userId,
        data,
      );
    } catch (error) {
      logServerError("keywords.saved.remove", error, {
        userId: context.userId,
        savedKeywordId: data.savedKeywordId,
      });
      throw toClientError(error);
    }
  });

export const getOrCreateDefaultProject = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .handler(async ({ context }) => {
    try {
      return await KeywordResearchService.getOrCreateDefaultProject(
        context.userId,
      );
    } catch (error) {
      logServerError("projects.get-or-create-default", error, {
        userId: context.userId,
      });
      throw toClientError(error);
    }
  });

export const getSerpAnalysis = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => serpAnalysisSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await KeywordResearchService.getSerpAnalysis(data);
    } catch (error) {
      logServerError("keywords.serp-analysis", error, {
        userId: context.userId,
        keyword: data.keyword,
      });
      throw toClientError(error);
    }
  });

const getProjectSchema = z.object({
  projectId: z.string().min(1),
});

export const getProject = createServerFn({ method: "POST" })
  .middleware([useSessionTokenClientMiddleware, ensureUserMiddleware])
  .inputValidator((data: unknown) => getProjectSchema.parse(data))
  .handler(async ({ data, context }) => {
    try {
      return await KeywordResearchService.getProject(
        context.userId,
        data.projectId,
      );
    } catch (error) {
      logServerError("projects.get", error, {
        userId: context.userId,
        projectId: data.projectId,
      });
      throw toClientError(error);
    }
  });
