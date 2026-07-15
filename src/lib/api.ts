import {
  AutocompleteSuggestion,
  EntityType,
  SearchEntity,
  SearchView,
  SortOption,
} from "@/types/entities";
import { CATEGORIES, COUNTRY_NAMES, MAX_PRICE, MOCK_ENTITIES, POPULAR_SEARCH_TERMS, PRICING_OPTIONS, TAG_POOL } from "./mockData";

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
  /** Feature tags, e.g. "API", "Open Source" — matches TAAFT's feature checkboxes. */
  features?: string[];
  countries?: string[];
  /** Inclusive USD price bounds. Entities with no priceAmount always pass. */
  priceMin?: number;
  priceMax?: number;
  sort: SortOption;
  /** "trending" and "leaderboard" rank by popularity; "forYou" uses `sort`. */
  view?: SearchView;
}

function matchesCommonFilters(
  e: SearchEntity,
  params: {
    query: string;
    types: EntityType[];
    categories: string[];
    pricing: string[];
    features: string[];
    countries: string[];
    priceMin?: number;
    priceMax?: number;
  }
): boolean {
  const { query, types, categories, pricing, features, countries, priceMin, priceMax } = params;

  const matchesQuery =
    !query ||
    e.title.toLowerCase().includes(query) ||
    e.description.toLowerCase().includes(query) ||
    e.tags.some((t) => t.toLowerCase().includes(query));
  const matchesType = types.length === 0 || types.includes(e.type);
  const matchesCategory = categories.length === 0 || categories.includes(e.category);
  const matchesPricing =
    pricing.length === 0 ||
    (typeof e.meta.pricing === "string" && pricing.includes(e.meta.pricing));
  const matchesFeatures = features.length === 0 || features.every((f) => e.tags.includes(f));
  const matchesCountry = countries.length === 0 || countries.includes(e.country);
  const matchesPrice =
    e.priceAmount === undefined ||
    ((priceMin === undefined || e.priceAmount >= priceMin) &&
      (priceMax === undefined || e.priceAmount <= priceMax));

  return (
    matchesQuery &&
    matchesType &&
    matchesCategory &&
    matchesPricing &&
    matchesFeatures &&
    matchesCountry &&
    matchesPrice
  );
}

export interface SearchResults {
  items: SearchEntity[];
  total: number;
}

export async function getSearchResults(
  params: SearchQueryParams
): Promise<SearchResults> {
  maybeFail();
  const {
    q,
    types,
    categories,
    pricing = [],
    features = [],
    countries = [],
    priceMin,
    priceMax,
    sort,
    view = "forYou",
  } = params;
  const query = q.trim().toLowerCase();
  const isRankedView = view === "trending" || view === "leaderboard";

  let items = MOCK_ENTITIES.filter((e) =>
    matchesCommonFilters(e, { query, types, categories, pricing, features, countries, priceMin, priceMax })
  );

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

  return delay({
    items,
    total,
  });
}

export interface FacetCounts {
  /** Count per entity type, ignoring the current type filter (so switching
   *  tabs never makes a count disappear) but respecting every other filter. */
  types: Partial<Record<EntityType, number>>;
  /** Count per category, ignoring the current category filter. */
  categories: Record<string, number>;
  /** Count per pricing option, ignoring the current pricing filter. */
  pricing: Record<string, number>;
  /** Count per feature tag, ignoring the current feature filter. */
  features: Record<string, number>;
  /** Count per country, ignoring the current country filter. */
  countries: Record<string, number>;
  /** Min/max priceAmount across all entities that have one — bounds for the price slider. */
  priceBounds: { min: number; max: number };
}

/**
 * Drives the live counters next to each Entity tab and each filter checkbox
 * (TAAFT shows e.g. "Tools 653", "Free 1,204" next to every option). Each
 * facet's own filter is deliberately excluded from its own count so picking
 * an option never zeroes out the other counts in that same facet, matching
 * how faceted search normally behaves.
 */
export async function getFacetCounts(params: {
  q: string;
  types: EntityType[];
  categories: string[];
  pricing?: string[];
  features?: string[];
  countries?: string[];
  priceMin?: number;
  priceMax?: number;
}): Promise<FacetCounts> {
  maybeFail();
  const {
    q,
    types,
    categories,
    pricing = [],
    features = [],
    countries = [],
    priceMin,
    priceMax,
  } = params;
  const query = q.trim().toLowerCase();

  const matchesQuery = (e: SearchEntity) =>
    !query ||
    e.title.toLowerCase().includes(query) ||
    e.description.toLowerCase().includes(query) ||
    e.tags.some((t) => t.toLowerCase().includes(query));
  const matchesType = (e: SearchEntity) => types.length === 0 || types.includes(e.type);
  const matchesCategory = (e: SearchEntity) => categories.length === 0 || categories.includes(e.category);
  const matchesPricing = (e: SearchEntity) =>
    pricing.length === 0 || (typeof e.meta.pricing === "string" && pricing.includes(e.meta.pricing));
  const matchesFeatures = (e: SearchEntity) => features.length === 0 || features.every((f) => e.tags.includes(f));
  const matchesCountry = (e: SearchEntity) => countries.length === 0 || countries.includes(e.country);
  const matchesPrice = (e: SearchEntity) =>
    e.priceAmount === undefined ||
    ((priceMin === undefined || e.priceAmount >= priceMin) &&
      (priceMax === undefined || e.priceAmount <= priceMax));

  const typeCounts: Partial<Record<EntityType, number>> = {};
  const categoryCounts: Record<string, number> = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  const pricingCounts: Record<string, number> = Object.fromEntries(PRICING_OPTIONS.map((p) => [p, 0]));
  const featureCounts: Record<string, number> = Object.fromEntries(TAG_POOL.map((f) => [f, 0]));
  const countryCounts: Record<string, number> = Object.fromEntries(COUNTRY_NAMES.map((c) => [c, 0]));
  let priceMinSeen = MAX_PRICE;
  let priceMaxSeen = 0;

  for (const e of MOCK_ENTITIES) {
    const base = matchesQuery(e);
    if (e.priceAmount !== undefined) {
      priceMinSeen = Math.min(priceMinSeen, e.priceAmount);
      priceMaxSeen = Math.max(priceMaxSeen, e.priceAmount);
    }

    if (base && matchesCategory(e) && matchesPricing(e) && matchesFeatures(e) && matchesCountry(e) && matchesPrice(e)) {
      typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1;
    }
    if (base && matchesType(e) && matchesPricing(e) && matchesFeatures(e) && matchesCountry(e) && matchesPrice(e)) {
      categoryCounts[e.category] = (categoryCounts[e.category] ?? 0) + 1;
    }
    if (
      base &&
      matchesType(e) &&
      matchesCategory(e) &&
      matchesFeatures(e) &&
      matchesCountry(e) &&
      matchesPrice(e) &&
      typeof e.meta.pricing === "string"
    ) {
      pricingCounts[e.meta.pricing] = (pricingCounts[e.meta.pricing] ?? 0) + 1;
    }
    if (base && matchesType(e) && matchesCategory(e) && matchesPricing(e) && matchesCountry(e) && matchesPrice(e)) {
      e.tags.forEach((tag) => {
        if (tag in featureCounts) featureCounts[tag] += 1;
      });
    }
    if (base && matchesType(e) && matchesCategory(e) && matchesPricing(e) && matchesFeatures(e) && matchesPrice(e)) {
      countryCounts[e.country] = (countryCounts[e.country] ?? 0) + 1;
    }
  }

  return delay(
    {
      types: typeCounts,
      categories: categoryCounts,
      pricing: pricingCounts,
      features: featureCounts,
      countries: countryCounts,
      priceBounds: { min: 0, max: priceMaxSeen > 0 ? priceMaxSeen : MAX_PRICE },
    },
    120
  );
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
