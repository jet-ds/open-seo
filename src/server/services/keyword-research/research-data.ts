import { fetchRelatedKeywordsRaw } from "@/server/lib/dataforseo";
import type { ResearchKeywordsInput } from "@/types/schemas/keywords";
import {
  normalizeIntent,
  normalizeKeyword,
  type EnrichedKeyword,
} from "./helpers";

export async function fetchResearchRows(
  input: ResearchKeywordsInput,
  uniqueKeywords: string[],
): Promise<EnrichedKeyword[]> {
  const seedKeyword = uniqueKeywords[0];
  if (!seedKeyword) {
    return [];
  }

  const items = await fetchRelatedKeywordsRaw(
    seedKeyword,
    input.locationCode,
    input.languageCode,
    input.resultLimit,
    3,
  );

  const rows: EnrichedKeyword[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const keyword = item.keyword_data?.keyword;
    if (!keyword) continue;

    const normalizedKeyword = normalizeKeyword(keyword);
    if (seen.has(normalizedKeyword)) continue;
    seen.add(normalizedKeyword);

    const keywordInfo = item.keyword_data
      ?.keyword_info_normalized_with_clickstream?.search_volume
      ? item.keyword_data.keyword_info_normalized_with_clickstream
      : item.keyword_data?.keyword_info;

    rows.push({
      keyword: normalizedKeyword,
      searchVolume: keywordInfo?.search_volume ?? null,
      trend: (keywordInfo?.monthly_searches ?? []).map((entry) => ({
        year: entry.year,
        month: entry.month,
        searchVolume: entry.search_volume ?? 0,
      })),
      cpc: item.keyword_data?.keyword_info?.cpc ?? null,
      competition: item.keyword_data?.keyword_info?.competition ?? null,
      keywordDifficulty:
        item.keyword_data?.keyword_properties?.keyword_difficulty ?? null,
      intent: normalizeIntent(
        item.keyword_data?.search_intent_info?.main_intent,
      ),
    });
  }

  return rows;
}
