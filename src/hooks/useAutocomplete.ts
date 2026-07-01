import { useEffect, useRef, useState } from "react";
import { getAutocomplete, getPopularSearches } from "@/lib/api";
import { AutocompleteSuggestion } from "@/types/entities";
import { useDebounce } from "./useDebounce";

export function useAutocomplete(rawQuery: string) {
  const query = useDebounce(rawQuery, 250);
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
    if (!query.trim()) {
      setSuggestions([]);
      setError(null);
      return;
    }
    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);

    getAutocomplete(query)
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
  }, [query]);

  return { suggestions, popular, isLoading, error };
}
