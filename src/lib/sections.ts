import {
  TrendingUp,
  Users,
  Puzzle,
  Sparkles,
  Trophy,
  Star,
  Layers,
  Bot,
  MessageSquare,
  ListChecks,
  Briefcase,
  MapPin,
  MessageCircle,
  Mail,
  LucideIcon,
} from "lucide-react";
import { EntityType, SearchView, SortOption } from "@/types/entities";

export type SectionKey =
  | "trending"
  | "characters"
  | "miniTools"
  | "new"
  | "rankings"
  | "featured"
  | "collections"
  | "agents"
  | "requests"
  | "tasks"
  | "findJob"
  | "nearMe"
  | "forum"
  | "newsletter";

export interface SectionConfig {
  key: SectionKey;
  label: string;
  slug: string;
  icon: LucideIcon;
  /** Which real entity type(s) this section pulls its results from. */
  types: EntityType[];
  view: SearchView;
  sort: SortOption;
  /**
   * Which row style this section renders in list view:
   * - "table": dense data-table rows (default)
   * - "trending": TAAFT's ranked-feed card (rank, votes, media, "#N in X")
   * - "gallery": TAAFT's tool-gallery card (image carousel, reviewer quote,
   *   bookmark, All/Top rated/New sub-tabs + search)
   */
  layout?: "table" | "trending" | "gallery" | "featured" | "collections" | "characters" | "new" | "rankings" | "agents" | "requests" | "tasksTable" | "jobBoard" | "newsletterBoard" | "forumBoard";
}

// Every pill maps to the closest real entity type (or ranked view) — each one
// opens its own page and always renders an actual, relevant list of results.
export const SECTIONS: SectionConfig[] = [
  { key: "trending", label: "Trending", slug: "trending", icon: TrendingUp, types: [], view: "trending", sort: "relevance", layout: "trending" },
  { key: "characters", label: "Characters", slug: "characters", icon: Users, types: ["robot"], view: "forYou", sort: "relevance", layout: "characters" },
  { key: "miniTools", label: "Mini tools", slug: "mini-tools", icon: Puzzle, types: ["tool"], view: "forYou", sort: "relevance", layout: "gallery" },
  { key: "new", label: "New", slug: "new", icon: Sparkles, types: [], view: "forYou", sort: "newest", layout: "new" },
  { key: "rankings", label: "Rankings", slug: "rankings", icon: Trophy, types: [], view: "leaderboard", sort: "relevance", layout: "rankings" },
  { key: "featured", label: "Featured", slug: "featured", icon: Star, types: [], view: "forYou", sort: "popular", layout: "featured" },
  { key: "collections", label: "Collections", slug: "collections", icon: Layers, types: ["collection"], view: "forYou", sort: "relevance", layout: "collections" },
  { key: "agents", label: "Agents", slug: "agents", icon: Bot, types: ["tool"], view: "forYou", sort: "popular", layout: "agents" },
  { key: "requests", label: "Requests", slug: "requests", icon: MessageSquare, types: ["task"], view: "forYou", sort: "newest", layout: "requests" },
  { key: "tasks", label: "Tasks", slug: "tasks", icon: ListChecks, types: ["task"], view: "forYou", sort: "relevance", layout: "tasksTable" },
  { key: "findJob", label: "Find A Job", slug: "find-a-job", icon: Briefcase, types: ["company"], view: "forYou", sort: "relevance", layout: "jobBoard" },
  { key: "nearMe", label: "Near me", slug: "near-me", icon: MapPin, types: ["country"], view: "forYou", sort: "relevance" },
  { key: "forum", label: "Forum", slug: "forum", icon: MessageCircle, types: ["news"], view: "forYou", sort: "newest", layout: "forumBoard" },
  { key: "newsletter", label: "Newsletter", slug: "newsletter", icon: Mail, types: ["news"], view: "forYou", sort: "popular", layout: "newsletterBoard" },
];

export function getSectionBySlug(slug: string): SectionConfig | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}

export const SECTION_DESCRIPTIONS: Record<SectionKey, string> = {
  trending: "What the AI community is looking at right now, across every category.",
  characters: "AI-powered robots and characters — from humanoids to mobile assistants.",
  miniTools: "Small, focused AI tools built to do one job well.",
  new: "The newest additions to the directory, freshest first.",
  rankings: "The all-time leaderboard, ranked by popularity.",
  featured: "Editorially featured picks worth a closer look.",
  collections: "Curated lists of tools grouped by use case.",
  agents: "Autonomous and semi-autonomous AI agents, ranked by popularity.",
  requests: "Looking for a specific AI tool? Post a request and someone in the community might build it, or point you to one that already exists.",
  tasks: "Browse by task — find the right tool for what you're trying to do.",
  findJob: "AI-native companies that are hiring.",
  nearMe: "Explore the AI scene by country.",
  forum: "Community discussion and news from across the AI world.",
  newsletter: "The most popular stories, newsletter-style.",
};