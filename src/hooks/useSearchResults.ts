import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getSearchResults } from "@/lib/api";
import {
  EntityType,
  PaginatedResult,
  SearchEntity,
  SearchView,
  SortOption,
  TimeRange,
} from "@/types/entities";

const VALID_SORTS: SortOption[] = ["relevance", "newest", "popular", "az"];
const VALID_VIEWS: SearchView[] = ["forYou", "trending", "leaderboard"];
const VALID_RANGES: TimeRange[] = ["today", "week", "month"];

function parseTypes(param: string | null): EntityType[] {
  if (!param) return [];
  return param.split(",").filter(Boolean) as EntityType[];
}

export function useSearchResults() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const types = useMemo(() => parseTypes(searchParams.get("types")), [searchParams]);
  const categories = useMemo(
    () => parseTypes(searchParams.get("categories")) as unknown as string[],
    [searchParams]
  );
  const pricing = useMemo(
    () => parseTypes(searchParams.get("pricing")) as unknown as string[],
    [searchParams]
  );
  const sort = (searchParams.get("sort") as SortOption) ?? "relevance";
  const safeSort = VALID_SORTS.includes(sort) ? sort : "relevance";
  const view = (searchParams.get("view") as SearchView) ?? "forYou";
  const safeView = VALID_VIEWS.includes(view) ? view : "forYou";
  const range = (searchParams.get("range") as TimeRange) ?? "week";
  const safeRange = VALID_RANGES.includes(range) ? range : "week";
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
  const setTypes = useCallback(
    (value: EntityType[]) => updateParams({ types: value.length ? value.join(",") : null }),
    [updateParams]
  );
  const setCategories = useCallback(
    (value: string[]) => updateParams({ categories: value.length ? value.join(",") : null }),
    [updateParams]
  );
  const setPricing = useCallback(
    (value: string[]) => updateParams({ pricing: value.length ? value.join(",") : null }),
    [updateParams]
  );
  const setSort = useCallback((value: SortOption) => updateParams({ sort: value }), [updateParams]);
  const setView = useCallback((value: SearchView) => updateParams({ view: value }), [updateParams]);
  const setRange = useCallback((value: TimeRange) => updateParams({ range: value }), [updateParams]);
  const setPage = useCallback(
    (value: number) => updateParams({ page: String(value) }, false),
    [updateParams]
  );

  useEffect(() => {
    let cancelled = false;
    // This is the standard "fetch when deps change" effect shape — loading/
    // error need to flip the instant the query changes, not after the async
    // call resolves. react-hooks/set-state-in-effect flags it anyway; once
    // this is wired to the real API, replacing this hook with SWR or
    // TanStack Query removes the manual state entirely and resolves it for
    // real instead of suppressing it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    getSearchResults({ q, types, categories, pricing, sort: safeSort, view: safeView, range: safeRange, page })
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
  }, [
    q,
    types.join(","),
    categories.join(","),
    pricing.join(","),
    safeSort,
    safeView,
    safeRange,
    page,
    retryToken,
  ]);

  return {
    q,
    types,
    categories,
    pricing,
    sort: safeSort,
    view: safeView,
    range: safeRange,
    page,
    data,
    isLoading,
    error,
    retry,
    setQuery,
    setTypes,
    setCategories,
    setPricing,
    setSort,
    setView,
    setRange,
    setPage,
  };
}