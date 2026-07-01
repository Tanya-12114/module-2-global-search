import { useCallback, useState } from "react";

const STORAGE_KEY = "search:recent";
const MAX_RECENT = 6;

/**
 * Recent searches are stored client-side for now. Once a logged-in user
 * concept exists (Module 11), swap this for a GET/POST to
 * /api/users/me/recent-searches and drop the localStorage calls.
 */
export function useRecentSearches() {
  // Lazy initializer: reads localStorage once on mount instead of via an
  // effect + setState. Safe under SSR (window is undefined server-side, so
  // it falls back to []), and the dropdown that renders this list is closed
  // by default, so there's nothing for hydration to mismatch on.
  const [recent, setRecent] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const addRecent = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_RECENT
      );
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable — fail silently, recent searches are non-critical
      }
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { recent, addRecent, clearRecent };
}