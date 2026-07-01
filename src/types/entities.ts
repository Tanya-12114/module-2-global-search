export type EntityType =
  | "tool"
  | "company"
  | "model"
  | "news"
  | "video"
  | "repository"
  | "collection";

export interface SearchEntity {
  id: string;
  type: EntityType;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  tags: string[];
  meta: Record<string, string | number>;
  popularityScore: number;
  createdAt: string; // ISO date
}

export type SortOption = "relevance" | "newest" | "popular" | "az";

export interface SearchFilters {
  types: EntityType[];
  categories: string[];
}

export interface SearchParamsState {
  q: string;
  types: EntityType[];
  categories: string[];
  sort: SortOption;
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
