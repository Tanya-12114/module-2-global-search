import { useEffect, useRef, useState } from "react";
import { getAutocomplete, getPopularSearches } from "@/lib/api";
import { AutocompleteSuggestion } from "@/types/entities";
import { useDebounce } from "./useDebounce";

export function useAutocomplete(rawQuery: string) {
  const query = useDebounce(rawQuery, 250);
  const trimmedQuery = query.trim();
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [popular, setPopular] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // Popular searches load once, shown when the input is empty.
  useEffect(() => {
    getPopularSearches()
      .then(setPopular)
      .catch(() => setPopular([]));
  }, []);

  useEffect(() => {
    if (!trimmedQuery) {
      // Bump the id so a late response for a since-cleared query is ignored.
      // No setState here — the empty case is derived below instead.
      requestId.current += 1;
      return;
    }
    const currentRequest = ++requestId.current;
    // Same standard fetch-on-deps-change shape as useSearchResults — see the
    // comment there for why this is suppressed rather than restructured.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    getAutocomplete(trimmedQuery)
      .then((results) => {
        if (currentRequest === requestId.current) {
          setSuggestions(results);
        }
      })
      .catch(() => {
        if (currentRequest === requestId.current) {
          setError("Couldn't load suggestions.");
          setSuggestions([]);
        }
      })
      .finally(() => {
        if (currentRequest === requestId.current) {
          setIsLoading(false);
        }
      });
  }, [trimmedQuery]);

  const isEmpty = !trimmedQuery;
  return {
    suggestions: isEmpty ? [] : suggestions,
    popular,
    isLoading: isEmpty ? false : isLoading,
    error: isEmpty ? null : error,
  };
}