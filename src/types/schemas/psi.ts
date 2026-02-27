import { z } from "zod";

const psiStrategies = ["mobile", "desktop"] as const;
const psiCategories = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
] as const;
const psiSources = ["single", "site"] as const;

export const psiAuditSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  url: z.string().min(1, "URL is required").max(2048),
  strategy: z.enum(psiStrategies).default("mobile"),
});

export type PsiAuditInput = z.infer<typeof psiAuditSchema>;

export const psiSearchSchema = z.object({
  url: z.string().catch("").default(""),
  strategy: z.enum(psiStrategies).catch("mobile").default("mobile"),
});

export type PsiSearchParams = z.infer<typeof psiSearchSchema>;

export const psiProjectKeySchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  apiKey: z.string().min(1, "API key is required").max(512),
});

export const psiProjectSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
});

export const psiAuditListSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  strategy: z.enum(psiStrategies).optional(),
  limit: z.number().int().min(1).max(200).default(50),
});

export const psiAuditDetailsSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  auditId: z.string().min(1, "Audit is required"),
});

export const psiIssueFilterSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  auditId: z.string().min(1, "Audit is required"),
  category: z.enum(psiCategories).optional(),
});

export const psiExportSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  auditId: z.string().min(1, "Audit is required"),
  mode: z.enum(["full", "issues", "category"]),
  category: z.enum(psiCategories).optional(),
});

export const psiUnifiedIssueSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  source: z.enum(psiSources),
  resultId: z.string().min(1, "Result id is required"),
  category: z.enum(psiCategories).optional(),
});

export const psiUnifiedExportSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  source: z.enum(psiSources),
  resultId: z.string().min(1, "Result id is required"),
  mode: z.enum(["full", "issues", "category"]),
  category: z.enum(psiCategories).optional(),
});

export const psiIssuesSearchSchema = z.object({
  source: z.enum(psiSources).catch("single").default("single"),
  category: z
    .enum(["all", ...psiCategories])
    .catch("all")
    .default("all"),
});
