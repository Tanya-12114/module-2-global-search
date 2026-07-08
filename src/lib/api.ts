import {
  AutocompleteSuggestion,
  EntityType,
  PaginatedResult,
  SearchEntity,
  SearchView,
  SortOption,
} from "@/types/entities";
import { MOCK_ENTITIES, POPULAR_SEARCH_TERMS } from "./mockData";

// ---------------------------------------------------------------------------
// Swap-in point for the real backend.
// Every function below returns exactly what its real REST equivalent will:
//   getAutocomplete   -> GET /api/search/autocomplete?q=
//   getPopularSearches-> GET /api/search/popular
//   getSearchResults  -> GET /api/search?q=&types=&categories=&sort=&page=
// When the main repo is ready, replace the function bodies with `fetch(...)`
// calls to those endpoints and delete mockData.ts. Nothing in /components
// or /hooks needs to change because they only depend on these signatures.
// ---------------------------------------------------------------------------

const NETWORK_DELAY_MS = 380;
const PAGE_SIZE = 20;

function delay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Simulates an occasional transient failure so the Error state is exercised. */
function maybeFail() {
  if (typeof window !== "undefined") {
    const forceError = window.localStorage.getItem("search:force-error");
    if (forceError === "1") {
      throw new Error("Network request failed. Please try again.");
    }
  }
}

export async function getAutocomplete(
  query: string
): Promise<AutocompleteSuggestion[]> {
  maybeFail();
  if (!query.trim()) return delay([]);
  const q = query.toLowerCase();
  const results = MOCK_ENTITIES.filter((e) =>
    e.title.toLowerCase().includes(q)
  )
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 6)
    .map<AutocompleteSuggestion>((e) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      category: e.category,
    }));
  return delay(results, 220);
}

export async function getPopularSearches(): Promise<string[]> {
  maybeFail();
  return delay(POPULAR_SEARCH_TERMS, 150);
}

export interface SearchQueryParams {
  q: string;
  types: EntityType[];
  categories: string[];
  pricing?: string[];
  sort: SortOption;
  /** "trending" and "leaderboard" rank by popularity; "forYou" uses `sort`. */
  view?: SearchView;
  page: number;
}

export async function getSearchResults(
  params: SearchQueryParams
): Promise<PaginatedResult<SearchEntity>> {
  maybeFail();
  const { q, types, categories, pricing = [], sort, view = "forYou", page } = params;
  const query = q.trim().toLowerCase();
  const isRankedView = view === "trending" || view === "leaderboard";

  let items = MOCK_ENTITIES.filter((e) => {
    const matchesQuery =
      !query ||
      e.title.toLowerCase().includes(query) ||
      e.description.toLowerCase().includes(query) ||
      e.tags.some((t) => t.toLowerCase().includes(query));
    const matchesType = types.length === 0 || types.includes(e.type);
    const matchesCategory =
      categories.length === 0 || categories.includes(e.category);
    const matchesPricing =
      pricing.length === 0 ||
      (typeof e.meta.pricing === "string" && pricing.includes(e.meta.pricing));
    return matchesQuery && matchesType && matchesCategory && matchesPricing;
  });

  if (isRankedView) {
    if (view === "trending") {
      // Trending blends popularity with recency (newer + popular ranks
      // highest) rather than hard-cutting off anything past a date window —
      // with a mock dataset this size, a strict "last 7 days" filter would
      // leave the page almost empty. Leaderboard, below, stays pure all-time
      // popularity so the two views still read differently.
      const now = Date.now();
      const trendScore = (e: SearchEntity) => {
        const ageDays = (now - new Date(e.createdAt).getTime()) / (24 * 60 * 60 * 1000);
        return e.popularityScore * (1 / (1 + ageDays / 60));
      };
      items = items.sort((a, b) => trendScore(b) - trendScore(a));
    } else {
      items = items.sort((a, b) => b.popularityScore - a.popularityScore);
    }
  } else {
    switch (sort) {
      case "newest":
        items = items.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "popular":
        items = items.sort((a, b) => b.popularityScore - a.popularityScore);
        break;
      case "az":
        items = items.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // relevance: exact/starts-with title matches first, then popularity
        items = items.sort((a, b) => {
          const aScore = a.title.toLowerCase().startsWith(query) ? 1 : 0;
          const bScore = b.title.toLowerCase().startsWith(query) ? 1 : 0;
          if (aScore !== bScore) return bScore - aScore;
          return b.popularityScore - a.popularityScore;
        });
    }
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = items.slice(start, start + PAGE_SIZE);

  return delay({
    items: pageItems,
    total,
    page: safePage,
    pageSize: PAGE_SIZE,
    totalPages,
  });
}

/**
 * Fetches a single entity for its detail page.
 * Real equivalent: GET /api/{type}/{slug} — e.g. /api/tools/pixelforge
 * This exists in Module 2 only as a temporary stand-in so links out of
 * search results resolve to *something* while Modules 3–10 build out
 * their real detail pages. Safe to delete once those exist.
 */
export async function getEntityBySlug(
  type: EntityType,
  slug: string
): Promise<SearchEntity | null> {
  maybeFail();
  const entity = MOCK_ENTITIES.find((e) => e.type === type && e.slug === slug);
  return delay(entity ?? null, 200);
}