"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, Pin, ChevronRight, Search as SearchIcon, LogIn, UserPlus } from "lucide-react";
import { ErrorState } from "@/components/search/states/ErrorState";
import { API_BASE_URL } from "@/lib/apiBaseUrl";

// ---------------------------------------------------------------------------
// Fetches from /api/forum/categories and /api/forum/topics
// (src/server/app.ts), backed by Postgres via Prisma.
// ---------------------------------------------------------------------------

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Topic {
  id: string;
  title: string;
  excerpt: string;
  category: Category;
  tags: string[];
  replies: number;
  views: number;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
}

const AVATAR_COLORS = ["#F472B6", "#60A5FA", "#4ADE80", "#FB923C", "#A78BFA", "#FBBF24", "#22D3EE"];

function seededRandom(seed: number) {
  let t = seed;
  return () => {
    t = (t * 1103515245 + 12345) % 2147483648;
    return t / 2147483648;
  };
}

function formatActivity(iso: string): string {
  const d = new Date(iso);
  const daysAgo = Math.round((Date.now() - d.getTime()) / 86_400_000);
  if (daysAgo > 300) return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// Cosmetic only — there's no user/reply-author data yet, so this renders a
// plausible-looking participant count (capped at 4) rather than inventing
// fake names.
function AvatarStack({ topicId, count }: { topicId: string; count: number }) {
  const rand = seededRandom(topicId.length + count + 1);
  const shown = Math.max(1, Math.min(4, count));
  return (
    <div className="flex shrink-0 -space-x-2">
      {Array.from({ length: shown }).map((_, i) => (
        <span
          key={i}
          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface text-[10px] font-semibold text-white"
          style={{ backgroundColor: AVATAR_COLORS[Math.floor(rand() * AVATAR_COLORS.length)] }}
        >
          {String.fromCharCode(65 + Math.floor(rand() * 26))}
        </span>
      ))}
    </div>
  );
}

function TopicRowSkeleton() {
  return (
    <div className="flex flex-col gap-2 py-3.5">
      <div className="skeleton h-4 w-2/3 rounded" />
      <div className="skeleton h-3 w-1/3 rounded" />
      <div className="skeleton h-3 w-full rounded" />
    </div>
  );
}

const TABS = ["Latest", "Hot", "Categories"] as const;
type Tab = (typeof TABS)[number];

export function ForumBoard() {
  const [tab, setTab] = useState<Tab>("Latest");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/forum/categories`)
      .then((res) => res.json())
      .then((data: { categories: Category[] }) => setCategories(data.categories))
      .catch(() => {
        /* Category sidebar just renders empty on failure — the topic fetch
           below surfaces the real error state. */
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (activeTag) params.set("tag", activeTag);
    params.set("sort", tab === "Hot" ? "hot" : "latest");

    fetch(`${API_BASE_URL}/api/forum/topics?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data: { topics: Topic[] }) => {
        if (!cancelled) setTopics(data.topics);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load forum topics. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab, activeCategory, activeTag, retryToken]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    topics.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    return [...set].slice(0, 5);
  }, [topics]);

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-border-hover hover:text-text-primary"
          >
            categories
            <ChevronRight size={12} />
          </button>
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-border-hover hover:text-text-primary"
          >
            tags
            <ChevronRight size={12} />
          </button>

          <div className="ml-1 flex items-center gap-4 border-l border-border pl-4">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`relative py-1.5 text-sm font-medium transition-colors ${
                  tab === t ? "text-accent" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {t}
                {tab === t && (
                  <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 rounded-full bg-accent" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-border-hover hover:text-text-primary"
          >
            <UserPlus size={13} />
            Sign Up
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
          >
            <LogIn size={13} />
            Log In
          </button>
          <button
            type="button"
            aria-label="Search forum"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
          >
            <SearchIcon size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <nav className="mb-6 flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => {
                setActiveCategory(null);
                setActiveTag(null);
              }}
              className={`rounded-md px-2.5 py-1.5 text-left text-sm font-medium ${
                !activeCategory && !activeTag
                  ? "bg-surface-active text-text-primary"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              Topics
            </button>
            <button
              type="button"
              className="rounded-md px-2.5 py-1.5 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            >
              More
            </button>
          </nav>

          <div className="mb-6">
            <p className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              Categories
            </p>
            <div className="flex flex-col gap-0.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategory(activeCategory === c.name ? null : c.name)}
                  className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                    activeCategory === c.name
                      ? "bg-surface-active text-text-primary"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  }`}
                >
                  <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: c.color }} />
                  {c.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className="px-2.5 py-1.5 text-left text-xs text-text-tertiary hover:text-text-primary"
              >
                All categories
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              Tags
            </p>
            <div className="flex flex-col gap-0.5">
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTag(activeTag === t ? null : t)}
                  className={`rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                    activeTag === t
                      ? "bg-surface-active text-text-primary"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  }`}
                >
                  #{t}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className="px-2.5 py-1.5 text-left text-xs text-text-tertiary hover:text-text-primary"
              >
                All tags
              </button>
            </div>
          </div>
        </aside>

        {/* Topic table */}
        <div>
          <div className="hidden border-b border-border pb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:gap-6">
            <span>Topic</span>
            <span className="w-14 text-right">Replies</span>
            <span className="w-14 text-right">Views</span>
            <span className="w-16 text-right">Activity</span>
          </div>

          {error ? (
            <div className="pt-4">
              <ErrorState message={error} onRetry={() => setRetryToken((t) => t + 1)} />
            </div>
          ) : isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <TopicRowSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex flex-col gap-2 py-3.5 sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-6"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {topic.locked && <Lock size={12} className="shrink-0 text-text-tertiary" />}
                        {topic.pinned && <Pin size={12} className="shrink-0 text-text-tertiary" />}
                        <h3 className="truncate text-sm font-semibold text-text-primary hover:text-accent">
                          {topic.title}
                        </h3>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-sm"
                          style={{ backgroundColor: topic.category.color }}
                        />
                        <span className="text-[11px] text-text-tertiary">{topic.category.name}</span>
                        {topic.tags.map((t) => (
                          <span key={t} className="text-[11px] text-text-tertiary">
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-text-secondary sm:line-clamp-1">
                        {topic.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:contents">
                      <AvatarStack topicId={topic.id} count={topic.replies} />
                      <span className="w-14 text-right text-sm tabular-nums text-text-secondary">
                        {topic.replies}
                      </span>
                      <span
                        className={`w-14 text-right text-sm tabular-nums ${
                          topic.views >= 500 ? "font-semibold text-warning" : "text-text-secondary"
                        }`}
                      >
                        {formatViews(topic.views)}
                      </span>
                      <span className="w-16 text-right text-xs text-text-tertiary">
                        {formatActivity(topic.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {topics.length === 0 && (
                <p className="py-10 text-center text-sm text-text-secondary">
                  No topics match this filter.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
