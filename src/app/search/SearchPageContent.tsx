"use client";

import { useMemo } from "react";
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
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
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <Filters allCategories={allCategories} selected={categories} onChange={setCategories} />
        </aside>

        <section className="flex flex-col gap-6">
          {isLoading && <LoadingState />}

          {!isLoading && error && <ErrorState message={error} onRetry={retry} />}

          {!isLoading && !error && data && data.items.length === 0 && (
            <EmptyState
              query={q}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={() => {
                setTypes([]);
                setCategories([]);
              }}
            />
          )}

          {!isLoading && !error && data && data.items.length > 0 && (
            <>
              <ResultsGrid items={data.items} />
              <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
