"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ResultsTable } from "@/components/search/ResultsTable";
import { LoadingState } from "@/components/search/states/LoadingState";
import { EmptyState } from "@/components/search/states/EmptyState";
import { ErrorState } from "@/components/search/states/ErrorState";
import { getSearchResults } from "@/lib/api";
import { getSectionBySlug, SECTION_DESCRIPTIONS } from "@/lib/sections";
import { PaginatedResult, SearchEntity } from "@/types/entities";

export function SectionPageContent({ slug }: { slug: string }) {
  const config = getSectionBySlug(slug);

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const [data, setData] = useState<PaginatedResult<SearchEntity> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!config) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getSearchResults({
      q: "",
      types: config.types,
      categories: [],
      sort: config.sort,
      view: config.view,
      page,
    })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError("Something went wrong while loading this page. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, page, retryToken]);

  if (!config) return null;

  function setPage(next: number) {
    router.push(`/search/${slug}?page=${next}`);
  }

  return (
    <main>
      <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <config.icon size={18} />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">{config.label}</h1>
            <p className="text-sm text-text-secondary">{SECTION_DESCRIPTIONS[config.key]}</p>
          </div>
        </div>

        <p className="mb-4 text-sm text-text-secondary">
          {isLoading ? "Loading…" : `${data?.total ?? 0} results in ${config.label}`}
        </p>

        {error ? (
          <ErrorState message={error} onRetry={() => setRetryToken((t) => t + 1)} />
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
          <EmptyState query="" hasActiveFilters={false} onClearFilters={() => setRetryToken((t) => t + 1)} />
        )}
      </div>
    </main>
  );
}
