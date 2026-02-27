/**
 * KV-based live crawl progress.
 *
 * During a crawl, each crawled URL is appended to a KV key so the UI can
 * poll for a live feed of crawled pages (most recent first).
 *
 * The KV entry auto-expires after 30 minutes — it's only needed while
 * the audit is running. Once finalized, we explicitly delete it.
 */
import { env } from "cloudflare:workers";

const KV_PREFIX = "audit-progress:";
const TTL_SECONDS = 30 * 60; // 30 minutes
const MAX_ENTRIES = 300;

export interface CrawledUrlEntry {
  url: string;
  statusCode: number;
  title: string;
  /** Unix timestamp ms when this page was crawled */
  crawledAt: number;
}

function key(auditId: string): string {
  return `${KV_PREFIX}${auditId}`;
}

/**
 * Append a crawled URL entry to the progress list.
 * Newest entries are prepended so the array is sorted newest-first.
 */
async function pushCrawledUrl(
  auditId: string,
  entry: CrawledUrlEntry,
): Promise<void> {
  await pushCrawledUrls(auditId, [entry]);
}

/**
 * Append multiple crawled URL entries in one KV write.
 * New entries are prepended and the list is capped.
 */
async function pushCrawledUrls(
  auditId: string,
  nextEntries: CrawledUrlEntry[],
): Promise<void> {
  if (nextEntries.length === 0) return;

  const k = key(auditId);
  const existing = await env.KV.get(k, "text");
  const entries: CrawledUrlEntry[] = existing ? JSON.parse(existing) : [];
  const merged = [...nextEntries, ...entries].slice(0, MAX_ENTRIES);

  await env.KV.put(k, JSON.stringify(merged), {
    expirationTtl: TTL_SECONDS,
  });
}

/**
 * Read all crawled URL entries for a running audit.
 * Returns newest-first.
 */
async function getCrawledUrls(auditId: string): Promise<CrawledUrlEntry[]> {
  const data = await env.KV.get(key(auditId), "text");
  if (!data) return [];
  return JSON.parse(data);
}

/**
 * Delete the progress key (called after audit completes).
 */
async function clear(auditId: string): Promise<void> {
  await env.KV.delete(key(auditId));
}

export const AuditProgressKV = {
  pushCrawledUrl,
  pushCrawledUrls,
  getCrawledUrls,
  clear,
} as const;
