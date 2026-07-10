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
  /** Country the entity is based in / associated with — drives the Country filter. */
  country: string;
  /**
   * Monthly price in USD, when applicable (0 for free entities, undefined
   * for entity types with no notion of price, e.g. news, videos). Drives
   * the Price range filter.
   */
  priceAmount?: number;
  meta: Record<string, string | number>;
  popularityScore: number;
  createdAt: string; // ISO date
}

export type SortOption = "relevance" | "newest" | "popular" | "az";

/** Primary result view, mirroring TAAFT's "For You / Trending / Leaderboard" tabs. */
export type SearchView = "forYou" | "trending" | "leaderboard";

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