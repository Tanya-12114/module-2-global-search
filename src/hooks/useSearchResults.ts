import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getSearchResults } from "@/lib/api";
import { EntityType, PaginatedResult, SearchEntity, SortOption } from "@/types/entities";

const VALID_SORTS: SortOption[] = ["relevance", "newest", "popular", "az"];

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
  const sort = (searchParams.get("sort") as SortOption) ?? "relevance";
  const safeSort = VALID_SORTS.includes(sort) ? sort : "relevance";
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
  const setSort = useCallback((value: SortOption) => updateParams({ sort: value }), [updateParams]);
  const setPage = useCallback(
    (value: number) => updateParams({ page: String(value) }, false),
    [updateParams]
  );

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getSearchResults({ q, types, categories, sort: safeSort, page })
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
  }, [q, types.join(","), categories.join(","), safeSort, page, retryToken]);

  return {
    q,
    types,
    categories,
    sort: safeSort,
    page,
    data,
    isLoading,
    error,
    retry,
    setQuery,
    setTypes,
    setCategories,
    setSort,
    setPage,
  };
}
