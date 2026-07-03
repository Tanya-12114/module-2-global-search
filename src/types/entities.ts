export type EntityType =
  | "tool"
  | "company"
  | "model"
  | "news"
  | "video"
  | "repository"
  | "collection"
  | "task"
  | "country"
  | "fundraise"
  | "investor"
  | "robot"
  | "device";

export interface SearchEntity {
  id: string;
  type: EntityType;
  title: string;
  slug: string; // used to build the link to this entity's own detail page
  description: string;
  imageUrl?: string;
  category: string;
  tags: string[];
  meta: Record<string, string | number>;
  popularityScore: number;
  createdAt: string; // ISO date
}

export type SortOption = "relevance" | "newest" | "popular" | "az";

/** Primary result view, mirroring TAAFT's "For You / Trending / Leaderboard" tabs. */
export type SearchView = "forYou" | "trending" | "leaderboard";

/** Time window applied to the Trending and Leaderboard views. */
export type TimeRange = "today" | "week" | "month";

export interface SearchFilters {
  types: EntityType[];
  categories: string[];
  pricing: string[];
}

export interface SearchParamsState {
  q: string;
  types: EntityType[];
  categories: string[];
  pricing: string[];
  sort: SortOption;
  view: SearchView;
  range: TimeRange;
  page: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AutocompleteSuggestion {
  id: string;
  type: EntityType;
  title: string;
  category: string;
}