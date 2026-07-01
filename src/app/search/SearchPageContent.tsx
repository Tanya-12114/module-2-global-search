"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, SlidersHorizontal, X } from "lucide-react";
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
      {/*
        Standalone-shell header, just so this module is navigable on its
        own. Module 1 owns the real site header/nav — swap this block for
        theirs (or delete it) once the modules are integrated.
      */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="Back to home"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-border-hover hover:bg-surface-hover hover:text-text-primary"
          >
            <ArrowLeft size={17} />
          </Link>
        </div>
      </header>

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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <Filters allCategories={allCategories} selected={categories} onChange={setCategories} />
        </aside>

        {isFilterDrawerOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsFilterDrawerOpen(false)}
              aria-hidden="true"
            />
            <div className="relative ml-auto flex h-full w-[85%] max-w-xs flex-col gap-4 overflow-y-auto bg-bg p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-text-primary">Filters</h2>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  aria-label="Close filters"
                  className="rounded-md p-1 text-text-tertiary hover:text-text-primary"
                >
                  <X size={18} />
                </button>
              </div>
              <Filters allCategories={allCategories} selected={categories} onChange={setCategories} />
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="mt-auto rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Show results
              </button>
            </div>
          </div>
        )}

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
    </>
  );
}