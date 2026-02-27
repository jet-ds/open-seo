const PSI_ENDPOINT =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const PSI_CATEGORIES = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
] as const;

type PsiCategory = (typeof PSI_CATEGORIES)[number];
type PsiStrategy = "mobile" | "desktop";

type PsiAuditMetric = {
  score: number | null;
  displayValue: string | null;
  numericValue: number | null;
};

type PsiAuditResult = {
  requestedUrl: string;
  finalUrl: string;
  strategy: PsiStrategy;
  fetchedAt: string;
  lighthouseVersion: string | null;
  scores: Record<PsiCategory, number | null>;
  metrics: {
    firstContentfulPaint: PsiAuditMetric;
    largestContentfulPaint: PsiAuditMetric;
    totalBlockingTime: PsiAuditMetric;
    cumulativeLayoutShift: PsiAuditMetric;
    speedIndex: PsiAuditMetric;
    timeToInteractive: PsiAuditMetric;
  };
  rawPayload: Record<string, unknown>;
};

type LighthouseAudit = {
  score?: number | null;
  displayValue?: string;
  numericValue?: number;
};

function normalizeInputUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("URL is required");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Only http and https URLs are supported");
    }
    return parsed.toString();
  } catch {
    throw new Error("Please enter a valid URL");
  }
}

function asScore(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null;
  return Math.round(value * 100);
}

function asMetric(audit: LighthouseAudit | undefined): PsiAuditMetric {
  return {
    score: asScore(audit?.score),
    displayValue: audit?.displayValue ?? null,
    numericValue:
      typeof audit?.numericValue === "number" ? audit.numericValue : null,
  };
}

function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const asRecord = payload as Record<string, unknown>;
  const error = asRecord.error;

  if (!error || typeof error !== "object") return null;

  const message = (error as Record<string, unknown>).message;
  return typeof message === "string" ? message : null;
}

async function runAudit(input: {
  url: string;
  strategy: PsiStrategy;
  apiKey: string;
}): Promise<PsiAuditResult> {
  const apiKey = input.apiKey.trim();
  if (!apiKey) {
    throw new Error("PSI API key is required");
  }

  const normalizedUrl = normalizeInputUrl(input.url);
  const params = new URLSearchParams({
    url: normalizedUrl,
    strategy: input.strategy,
  });

  for (const category of PSI_CATEGORIES) {
    params.append("category", category);
  }

  params.append("key", apiKey);

  const response = await fetch(`${PSI_ENDPOINT}?${params.toString()}`);
  const payload = (await response.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!response.ok) {
    const message = extractErrorMessage(payload);
    throw new Error(message ?? `PSI request failed (${response.status})`);
  }

  const lighthouseResult = (payload?.lighthouseResult ?? null) as Record<
    string,
    unknown
  > | null;

  if (!lighthouseResult) {
    throw new Error("PSI returned an invalid response");
  }

  const categories = (lighthouseResult.categories ?? {}) as Record<
    string,
    { score?: number | null }
  >;
  const audits = (lighthouseResult.audits ?? {}) as Record<
    string,
    LighthouseAudit
  >;

  return {
    requestedUrl: normalizedUrl,
    finalUrl:
      (lighthouseResult.finalDisplayedUrl as string | undefined) ??
      normalizedUrl,
    strategy: input.strategy,
    fetchedAt: new Date().toISOString(),
    lighthouseVersion:
      (lighthouseResult.lighthouseVersion as string | undefined) ?? null,
    scores: {
      performance: asScore(categories.performance?.score),
      accessibility: asScore(categories.accessibility?.score),
      "best-practices": asScore(categories["best-practices"]?.score),
      seo: asScore(categories.seo?.score),
    },
    metrics: {
      firstContentfulPaint: asMetric(audits["first-contentful-paint"]),
      largestContentfulPaint: asMetric(audits["largest-contentful-paint"]),
      totalBlockingTime: asMetric(audits["total-blocking-time"]),
      cumulativeLayoutShift: asMetric(audits["cumulative-layout-shift"]),
      speedIndex: asMetric(audits["speed-index"]),
      timeToInteractive: asMetric(audits.interactive),
    },
    rawPayload: payload ?? {},
  };
}

export const PsiService = {
  runAudit,
} as const;
