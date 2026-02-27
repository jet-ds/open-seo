import { useState, useEffect, useCallback } from "react";

export interface SearchHistoryItem {
  keyword: string;
  locationCode: number;
  locationName: string;
  timestamp: number;
}

const MAX_HISTORY = 20;

function storageKey(projectId: string) {
  return `search-history:${projectId}`;
}

function loadHistory(projectId: string): SearchHistoryItem[] {
  try {
    const raw = localStorage.getItem(storageKey(projectId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item): item is SearchHistoryItem =>
          item &&
          typeof item.keyword === "string" &&
          typeof item.locationCode === "number" &&
          typeof item.locationName === "string" &&
          typeof item.timestamp === "number",
      )
      .slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

function saveHistory(projectId: string, items: SearchHistoryItem[]) {
  try {
    localStorage.setItem(storageKey(projectId), JSON.stringify(items));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function useSearchHistory(projectId: string) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount / when projectId changes
  useEffect(() => {
    setHistory(loadHistory(projectId));
    setIsLoaded(true);
  }, [projectId]);

  const addSearch = useCallback(
    (keyword: string, locationCode: number, locationName: string) => {
      setHistory((prev) => {
        // Remove any existing entry for the same keyword+location
        const filtered = prev.filter(
          (item) =>
            !(item.keyword === keyword && item.locationCode === locationCode),
        );
        const next = [
          { keyword, locationCode, locationName, timestamp: Date.now() },
          ...filtered,
        ].slice(0, MAX_HISTORY);
        saveHistory(projectId, next);
        return next;
      });
    },
    [projectId],
  );

  const removeHistoryItem = useCallback(
    (timestamp: number) => {
      setHistory((prev) => {
        const next = prev.filter((item) => item.timestamp !== timestamp);
        saveHistory(projectId, next);
        return next;
      });
    },
    [projectId],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory(projectId, []);
  }, [projectId]);

  return { history, isLoaded, addSearch, clearHistory, removeHistoryItem };
}
