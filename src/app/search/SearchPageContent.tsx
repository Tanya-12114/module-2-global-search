"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { EntityTabs } from "@/components/search/EntityTabs";
import { Filters } from "@/components/search/Filters";
import { SortSelect } from "@/components/search/SortSelect";
import { Pagination } from "@/components/search/Pagination";
import { ResultsGrid } from "@/components/search/ResultsGrid";
import { LoadingState } from "@/components/search/states/LoadingState";
import { EmptyState } from "@/components/search/states/EmptyState";
import { ErrorState } from "@/components/search/states/ErrorState";
import { useSearchResults } from "@/hooks/useSearchResults";
import { getAllCategories } from "@/lib/api";

export function SearchPageContent() {
  const {
    q,
    types,
    categories,
    sort,
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
  } = useSearchResults();

  const allCategories = useMemo(() => getAllCategories(), []);
  const hasActiveFilters = types.length > 0 || categories.length > 0;
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto mb-6 max-w-2xl">
        <SearchBar initialValue={q} onSubmit={setQuery} autoFocus />
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <EntityTabs selected={types} onChange={setTypes} />
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            {isLoading ? "Searching…" : `${data?.total ?? 0} results`}
            {q && !isLoading ? <> for &ldquo;{q}&rdquo;</> : null}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-text-secondary hover:border-border-hover hover:text-text-primary md:hidden"
            >
              <SlidersHorizontal size={14} />
              Filters
              {categories.length > 0 && (
                <span className="rounded-full bg-accent-soft px-1.5 text-xs text-accent">
                  {categories.length}
                </span>
              )}
            </button>
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <Filters
            allCategories={allCategories}
            selected={categories}
            onChange={setCategories}
          />
        </aside>

        <div className="min-w-0 flex-1">
          {error ? (
            <ErrorState message={error} onRetry={retry} />
          ) : isLoading ? (
            <LoadingState />
          ) : data && data.items.length > 0 ? (
            <>
              <ResultsGrid items={data.items} />
              <div className="mt-8">
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          ) : (
            <EmptyState
              hasQuery={Boolean(q)}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={() => {
                setTypes([]);
                setCategories([]);
              }}
            />
          )}
        </div>
      </div>

      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Close filters"
            onClick={() => setIsFilterDrawerOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] overflow-y-auto bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-text-primary">Filters</h2>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                aria-label="Close filters"
                className="rounded-full p-1 text-text-tertiary hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>
            <Filters
              allCategories={allCategories}
              selected={categories}
              onChange={setCategories}
            />
          </div>
        </div>
      )}
      </main>
    </>
  );
}