import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FacetCounts, getFacetCounts, getSearchResults } from "@/lib/api";
import { EntityType, PaginatedResult, SearchEntity, SortOption } from "@/types/entities";

function parseList(param: string | null): string[] {
  if (!param) return [];
  return param.split(",").filter(Boolean);
}

function parseTypes(param: string | null): EntityType[] {
  return parseList(param) as EntityType[];
}

function parseSort(param: string | null): SortOption {
  const allowed: SortOption[] = ["relevance", "newest", "popular", "az"];
  return allowed.includes(param as SortOption) ? (param as SortOption) : "relevance";
}

/**
 * Drives the /search/results page: reads q, types, categories, pricing,
 * features, countries, price range, sort and page from the URL — so every
 * filter/tab/sort choice is shareable and back-button-safe, same as TAAFT —
 * fetches matching results plus live facet counts, and exposes setters for
 * each filter dimension.
 */
export function useSearchResults() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const types = useMemo(() => parseTypes(searchParams.get("types")), [searchParams]);
  const categories = useMemo(() => parseList(searchParams.get("categories")), [searchParams]);
  const pricing = useMemo(() => parseList(searchParams.get("pricing")), [searchParams]);
  const features = useMemo(() => parseList(searchParams.get("features")), [searchParams]);
  const countries = useMemo(() => parseList(searchParams.get("countries")), [searchParams]);
  const sort = parseSort(searchParams.get("sort"));
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const priceMinParam = searchParams.get("priceMin");
  const priceMaxParam = searchParams.get("priceMax");
  const priceMin = priceMinParam !== null ? Number(priceMinParam) : undefined;
  const priceMax = priceMaxParam !== null ? Number(priceMaxParam) : undefined;

  const [data, setData] = useState<PaginatedResult<SearchEntity> | null>(null);
  const [facets, setFacets] = useState<FacetCounts | null>(null);
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
  const setFeatures = useCallback(
    (value: string[]) => updateParams({ features: value.length ? value.join(",") : null }),
    [updateParams]
  );
  const setCountries = useCallback(
    (value: string[]) => updateParams({ countries: value.length ? value.join(",") : null }),
    [updateParams]
  );
  const setPriceRange = useCallback(
    (value: [number, number], bounds: { min: number; max: number }) =>
      updateParams({
        priceMin: value[0] === bounds.min ? null : String(value[0]),
        priceMax: value[1] === bounds.max ? null : String(value[1]),
      }),
    [updateParams]
  );
  const setSort = useCallback(
    (value: SortOption) => updateParams({ sort: value === "relevance" ? null : value }, false),
    [updateParams]
  );
  const setPage = useCallback(
    (value: number) => updateParams({ page: String(value) }, false),
    [updateParams]
  );
  const clearFilters = useCallback(
    () =>
      updateParams({
        types: null,
        categories: null,
        pricing: null,
        features: null,
        countries: null,
        priceMin: null,
        priceMax: null,
      }),
    [updateParams]
  );

  const hasActiveFilters =
    types.length > 0 ||
    categories.length > 0 ||
    pricing.length > 0 ||
    features.length > 0 ||
    countries.length > 0 ||
    priceMin !== undefined ||
    priceMax !== undefined;

  const typesKey = types.join(",");
  const categoriesKey = categories.join(",");
  const pricingKey = pricing.join(",");
  const featuresKey = features.join(",");
  const countriesKey = countries.join(",");

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    Promise.all([
      getSearchResults({
        q,
        types,
        categories,
        pricing,
        features,
        countries,
        priceMin,
        priceMax,
        sort,
        view: "forYou",
        page,
      }),
      getFacetCounts({ q, types, categories, pricing, features, countries, priceMin, priceMax }),
    ])
      .then(([result, facetCounts]) => {
        if (!cancelled) {
          setData(result);
          setFacets(facetCounts);
        }
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
    typesKey,
    categoriesKey,
    pricingKey,
    featuresKey,
    countriesKey,
    priceMin,
    priceMax,
    sort,
    page,
    retryToken,
  ]);

  return {
    q,
    types,
    categories,
    pricing,
    features,
    countries,
    priceMin,
    priceMax,
    sort,
    page,
    data,
    facets,
    isLoading,
    error,
    retry,
    hasActiveFilters,
    setQuery,
    setTypes,
    setCategories,
    setPricing,
    setFeatures,
    setCountries,
    setPriceRange,
    setSort,
    setPage,
    clearFilters,
  };
}
