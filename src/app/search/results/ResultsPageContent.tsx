"use client";

import { SearchIcon } from "lucide-react";
import { ResultsTable } from "@/components/search/ResultsTable";
import { LoadingState } from "@/components/search/states/LoadingState";
import { EmptyState } from "@/components/search/states/EmptyState";
import { ErrorState } from "@/components/search/states/ErrorState";
import { useSearchResults } from "@/hooks/useSearchResults";

/**
 * The dedicated, full-page results view. Every search — typed in the Ctrl+K
 * modal, a quick shortcut, or a header nav link like Trending/Collections —
 * lands here on its own screen: a title and the results list. It
 * deliberately does NOT reuse the big /search hero, so it reads as its own
 * page rather than the hero page with results appended below it.
 */
export function ResultsPageContent() {
  const { q, page, data, isLoading, error, retry, setQuery, setPage } = useSearchResults();

  return (
    <main>
      <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <SearchIcon size={18} />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              {q ? <>Results for &ldquo;{q}&rdquo;</> : "Search results"}
            </h1>
            <p className="text-sm text-text-secondary">
              {isLoading ? "Searching…" : `${data?.total ?? 0} results`}
            </p>
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
              <div className="mt-6 flex items-center justify-center gap-2 text-sm">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="rounded-md border border-border px-3 py-1.5 text-text-secondary hover:border-border-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-text-tertiary">
                  Page {data.page} of {data.totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                  disabled={page >= data.totalPages}
                  className="rounded-md border border-border px-3 py-1.5 text-text-secondary hover:border-border-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState query={q} hasActiveFilters={false} onClearFilters={() => setQuery("")} />
        )}
      </div>
    </main>
  );
}
