"use client";

import { SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { EntityTabs } from "@/components/search/EntityTabs";
import { Filters } from "@/components/search/Filters";
import { SortSelect } from "@/components/search/SortSelect";
import { Pagination } from "@/components/search/Pagination";
import { ResultsTable } from "@/components/search/ResultsTable";
import { LoadingState } from "@/components/search/states/LoadingState";
import { EmptyState } from "@/components/search/states/EmptyState";
import { ErrorState } from "@/components/search/states/ErrorState";
import { useSearchResults } from "@/hooks/useSearchResults";
import { CATEGORIES, COUNTRY_NAMES, MAX_PRICE, PRICING_OPTIONS, TAG_POOL } from "@/lib/mockData";

/**
 * The dedicated, full-page results view — the TAAFT-style layout: entity
 * tabs across the top (with live counts), a filter sidebar on the left
 * (category, pricing, features, country, price range — all with live
 * counts), and sort + numbered pagination on the right. Every filter is
 * driven by the URL so any combination is a shareable link.
 */
export function ResultsPageContent() {
  const {
    q,
    types,
    categories,
    pricing,
    features,
    countries,
    priceMin,
    priceMax,
    sort,
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
  } = useSearchResults();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const priceBounds = facets?.priceBounds ?? { min: 0, max: MAX_PRICE };
  const priceRange: [number, number] = [priceMin ?? priceBounds.min, priceMax ?? priceBounds.max];

  const activeFilterCount =
    categories.length +
    pricing.length +
    features.length +
    countries.length +
    (types.length ? 1 : 0) +
    (priceMin !== undefined || priceMax !== undefined ? 1 : 0);

  const filtersPanel = (
    <Filters
      allCategories={CATEGORIES}
      selected={categories}
      onChange={setCategories}
      categoryCounts={facets?.categories}
      allPricing={PRICING_OPTIONS}
      selectedPricing={pricing}
      onPricingChange={setPricing}
      pricingCounts={facets?.pricing}
      allFeatures={TAG_POOL}
      selectedFeatures={features}
      onFeaturesChange={setFeatures}
      featureCounts={facets?.features}
      allCountries={COUNTRY_NAMES}
      selectedCountries={countries}
      onCountriesChange={setCountries}
      countryCounts={facets?.countries}
      priceBounds={priceBounds}
      priceRange={priceRange}
      onPriceRangeChange={(range) => setPriceRange(range, priceBounds)}
    />
  );

  return (
    <main>
      <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <SearchIcon size={18} />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              {q ? <>Results for &ldquo;{q}&rdquo;</> : "Search results"}
            </h1>
            <p className="text-sm text-text-secondary">
              {isLoading ? "Searching…" : `${data?.total.toLocaleString() ?? 0} results`}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <EntityTabs selected={types} onChange={setTypes} counts={facets?.types} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">{filtersPanel}</div>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-text-secondary hover:border-border-hover hover:text-text-primary lg:hidden"
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-accent px-1.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="hidden items-center gap-1 text-xs text-text-tertiary hover:text-text-primary sm:flex"
                >
                  <X size={12} />
                  Clear filters
                </button>
              )}

              <div className="ml-auto">
                <SortSelect value={sort} onChange={setSort} />
              </div>
            </div>

            {error ? (
              <ErrorState message={error} onRetry={retry} />
            ) : isLoading ? (
              <LoadingState />
            ) : data && data.items.length > 0 ? (
              <>
                <ResultsTable
                  items={data.items}
                  startRank={(data.page - 1) * data.pageSize + 1}
                />
                {data.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                query={q}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={() => {
                  clearFilters();
                  if (!hasActiveFilters) setQuery("");
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Filters — mobile bottom sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-xl border-t border-border bg-bg p-4 pb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-hover"
              >
                <X size={16} />
              </button>
            </div>
            {filtersPanel}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-4 w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white"
            >
              Show {data?.total.toLocaleString() ?? 0} results
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
