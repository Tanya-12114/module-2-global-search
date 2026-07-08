import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getSearchResults } from "@/lib/api";
import { EntityType, PaginatedResult, SearchEntity } from "@/types/entities";

function parseTypes(param: string | null): EntityType[] {
  if (!param) return [];
  return param.split(",").filter(Boolean) as EntityType[];
}

/**
 * Drives the /search/results page: reads `q` and `types` from the URL (the
 * only params anything in the app still sets — e.g. the header's News/
 * Companies links use ?types=), fetches matching results, and exposes
 * pagination + a query setter.
 */
export function useSearchResults() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const types = useMemo(() => parseTypes(searchParams.get("types")), [searchParams]);
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const [data, setData] = useState<PaginatedResult<SearchEntity> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const retry = useCallback(() => setRetryToken((t) => t + 1), []);

  const updateParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      if (resetPage) next.delete("page");
      router.push(`${pathname}?${next.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const setQuery = useCallback((value: string) => updateParams({ q: value || null }), [updateParams]);
  const setPage = useCallback(
    (value: number) => updateParams({ page: String(value) }, false),
    [updateParams]
  );

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    getSearchResults({ q, types, categories: [], sort: "relevance", view: "forYou", page })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError("Something went wrong while searching. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, types.join(","), page, retryToken]);

  return { q, page, data, isLoading, error, retry, setQuery, setPage };
}
