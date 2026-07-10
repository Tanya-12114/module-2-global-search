"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { ResultsTable } from "@/components/search/ResultsTable";
import { TrendingList } from "@/components/search/TrendingList";
import { MiniToolsList } from "@/components/search/MiniToolsList";
import { FeaturedList } from "@/components/search/FeaturedList";
import { CollectionsTable } from "@/components/search/CollectionsTable";
import { CharactersGrid } from "@/components/search/CharactersGrid";
import { NewReleasesList } from "@/components/search/NewReleasesList";
import { RankingsBoard } from "@/components/search/RankingsBoard";
import { AgentsGrid } from "@/components/search/AgentsGrid";
import { RequestsList } from "@/components/search/RequestsList";
import { TasksTable } from "@/components/search/TasksTable";
import { JobBoard } from "@/components/search/JobBoard";
import { NewsletterBoard } from "@/components/search/NewsletterBoard";
import { ForumBoard } from "@/components/search/ForumBoard";
import { Pagination } from "@/components/search/Pagination";
import { LoadingState } from "@/components/search/states/LoadingState";
import { EmptyState } from "@/components/search/states/EmptyState";
import { ErrorState } from "@/components/search/states/ErrorState";
import { getSearchResults } from "@/lib/api";
import { getSectionBySlug, SECTION_DESCRIPTIONS } from "@/lib/sections";
import { PaginatedResult, SearchEntity, SortOption } from "@/types/entities";

/** Sub-tabs shown above "gallery" layout sections (e.g. Mini tools), mapped
 *  onto the existing sort options so no new backend concept is needed. */
const GALLERY_TABS: { label: string; sort: SortOption }[] = [
  { label: "All", sort: "relevance" },
  { label: "Top rated", sort: "popular" },
  { label: "New", sort: "newest" },
];

export function SectionPageContent({ slug }: { slug: string }) {
  const config = getSectionBySlug(slug);

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const [data, setData] = useState<PaginatedResult<SearchEntity> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  // Only used by the "gallery" layout (Mini tools): its own sort tabs and
  // search box, independent of the global search bar.
  const [gallerySort, setGallerySort] = useState<SortOption>(config?.sort ?? "relevance");
  const [galleryQueryInput, setGalleryQueryInput] = useState("");
  const [galleryQuery, setGalleryQuery] = useState("");

  // Only used by the "collections" layout: its own New/Popular filter,
  // mapped onto the existing sort options.
  const [collectionsFilter, setCollectionsFilter] = useState<"new" | "popular">("new");

  const isGallery = config?.layout === "gallery";
  const isCollections = config?.layout === "collections";
  const isNewReleases = config?.layout === "new";
  const isRankings = config?.layout === "rankings";
  const isAgents = config?.layout === "agents";
  const isTasksTable = config?.layout === "tasksTable";
  const effectiveSort = isGallery
    ? gallerySort
    : isCollections
      ? collectionsFilter === "new"
        ? "newest"
        : "popular"
      : config?.sort ?? "relevance";
  const effectiveQuery = isGallery ? galleryQuery : "";

  useEffect(() => {
    if (!config) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    getSearchResults({
      q: effectiveQuery,
      types: config.types,
      categories: [],
      sort: effectiveSort,
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
  }, [slug, page, effectiveSort, effectiveQuery, retryToken]);

  if (!config) return null;

  if (config.layout === "jobBoard") {
    return (
      <main>
        <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
          <JobBoard />
        </div>
      </main>
    );
  }

  if (config.layout === "newsletterBoard") {
    return (
      <main>
        <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
          <NewsletterBoard />
        </div>
      </main>
    );
  }

  if (config.layout === "forumBoard") {
    return (
      <main>
        <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
          <ForumBoard />
        </div>
      </main>
    );
  }

  if (config.layout === "requests") {
    return (
      <main>
        <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
          <RequestsList />
        </div>
      </main>
    );
  }

  function setPage(next: number) {
    router.push(`/search/${slug}?page=${next}`);
  }

  return (
    <main>
      <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
        {!isCollections && !isNewReleases && !isRankings && !isAgents && !isTasksTable && (
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <config.icon size={18} />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">{config.label}</h1>
              <p className="text-sm text-text-secondary">{SECTION_DESCRIPTIONS[config.key]}</p>
            </div>
          </div>
        )}

        {isGallery && (
          <div className="mb-5">
            <div className="mb-4 inline-flex rounded-full border border-border bg-surface p-1">
              {GALLERY_TABS.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => {
                    setGallerySort(tab.sort);
                    setPage(1);
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    gallerySort === tab.sort
                      ? "bg-text-primary text-bg"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <label className="mb-1.5 block text-xs text-text-tertiary">
              Search {config.label.toLowerCase()}
            </label>
            <form
              className="flex max-w-lg gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setGalleryQuery(galleryQueryInput);
                setPage(1);
              }}
            >
              <input
                value={galleryQueryInput}
                onChange={(e) => setGalleryQueryInput(e.target.value)}
                placeholder="Search by tool name or slug"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary hover:border-border-hover focus:border-border-hover"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                <SearchIcon size={14} />
                Search
              </button>
            </form>
          </div>
        )}

        {!isCollections && !isNewReleases && !isRankings && !isAgents && !isTasksTable && (
          <p className="mb-4 text-sm text-text-secondary">
            {isLoading ? "Loading…" : `${data?.total ?? 0} results in ${config.label}`}
          </p>
        )}

        {error ? (
          <ErrorState message={error} onRetry={() => setRetryToken((t) => t + 1)} />
        ) : isLoading ? (
          <LoadingState />
        ) : data && data.items.length > 0 ? (
          <>
            {config.layout === "trending" ? (
              <TrendingList
                items={data.items}
                startRank={(data.page - 1) * data.pageSize + 1}
                sectionLabel={config.label}
              />
            ) : config.layout === "gallery" ? (
              <MiniToolsList items={data.items} />
            ) : config.layout === "featured" ? (
              <FeaturedList items={data.items} />
            ) : config.layout === "collections" ? (
              <CollectionsTable
                items={data.items}
                total={data.total}
                filter={collectionsFilter}
                onFilterChange={(f) => {
                  setCollectionsFilter(f);
                  setPage(1);
                }}
              />
            ) : config.layout === "characters" ? (
              <CharactersGrid items={data.items} />
            ) : config.layout === "new" ? (
              <NewReleasesList items={data.items} startRank={(data.page - 1) * data.pageSize + 1} />
            ) : config.layout === "rankings" ? (
              <RankingsBoard items={data.items} startRank={(data.page - 1) * data.pageSize + 1} />
            ) : config.layout === "agents" ? (
              <AgentsGrid items={data.items} />
            ) : config.layout === "tasksTable" ? (
              <TasksTable items={data.items} total={data.total} />
            ) : (
              <ResultsTable
                items={data.items}
                startRank={(data.page - 1) * data.pageSize + 1}
              />
            )}
            {data.totalPages > 1 && (
              <div className="mt-6">
                <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            query={effectiveQuery}
            hasActiveFilters={false}
            onClearFilters={() => {
              setGalleryQueryInput("");
              setGalleryQuery("");
              setRetryToken((t) => t + 1);
            }}
          />
        )}
      </div>
    </main>
  );
}