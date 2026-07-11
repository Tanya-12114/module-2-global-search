"use client";

import { useMemo, useState } from "react";
import { Lock, Pin, ChevronRight, Search as SearchIcon, LogIn, UserPlus } from "lucide-react";

// ---------------------------------------------------------------------------
// Self-contained mock dataset. Forum topics aren't a real entity type in the
// search module yet (see src/types/entities.ts) — this generates a
// deterministic set of topics, categories, and tags client-side. Swap
// `buildTopics()` for a real fetch once a `topic` entity type + API endpoint
// exist.
// ---------------------------------------------------------------------------

interface Category {
  name: string;
  color: string;
}

const CATEGORIES: Category[] = [
  { name: "AI Builders", color: "#F97316" },
  { name: "AI Users", color: "#3B82F6" },
  { name: "General", color: "#22C55E" },
  { name: "Site Feedback", color: "#9CA3AF" },
];

const TAGS = ["chatgpt", "tools", "agents", "prompts", "no-code"];

const AVATAR_COLORS = ["#F472B6", "#60A5FA", "#4ADE80", "#FB923C", "#A78BFA", "#FBBF24", "#22D3EE"];

interface Topic {
  id: string;
  title: string;
  excerpt: string;
  category: Category;
  tags: string[];
  replies: number;
  views: number;
  activity: string; // pre-formatted, e.g. "Jun 4" or "Jan 2023"
  avatars: string[]; // initials
  pinned?: boolean;
  locked?: boolean;
}

const TOPIC_SEEDS: { title: string; excerpt: string }[] = [
  {
    title: "Welcome to the AI community",
    excerpt:
      "Welcome! Here we discuss everything AI from the point of view of people using AI, but also people building AI tools. Together we can build the future we deserve. This community is…",
  },
  {
    title: "One API Marketplace For All AI Models",
    excerpt: "Has anyone found a single marketplace that actually aggregates every model provider cleanly?",
  },
  {
    title: "Who can mentor a no-coder on apps building?",
    excerpt: "Looking for someone patient enough to walk me through shipping my first AI-powered app.",
  },
  {
    title: "Why building around a single AI model is starting to feel risky",
    excerpt: "Pricing changes and rate limits from a single provider nearly broke our roadmap last month.",
  },
  {
    title: "Can AI ever feel emotionally intelligent to you?",
    excerpt: "Curious how many of you have had a genuinely comforting conversation with a model.",
  },
  {
    title: "Memes for make benefit our glorious AI overlords",
    excerpt: "Drop your best AI memes here — we've all earned a laugh after this week's model launches.",
  },
  {
    title: "How to clean up videos?",
    excerpt: "What's everyone using these days for quick denoise + upscale passes on old footage?",
  },
  {
    title: "Software engineer, partner need",
    excerpt: "Looking for a technical co-founder for an AI-native productivity tool. DMs open.",
  },
  {
    title: "Insurance investment plans grow wealth with protection",
    excerpt: "Has anyone actually automated their portfolio rebalancing with an AI agent successfully?",
  },
  {
    title: "Best practices for evaluating a new model release",
    excerpt: "What's your checklist before swapping a production workload onto a freshly released model?",
  },
  {
    title: "Anyone else hitting rate limits constantly?",
    excerpt: "Curious if others are seeing the same throttling this week or if it's just our account.",
  },
  {
    title: "Prompt libraries worth bookmarking",
    excerpt: "Sharing a running list of prompt collections that have actually held up over time.",
  },
  {
    title: "Is fine-tuning still worth it in 2026?",
    excerpt: "With context windows this large, wondering if fine-tuning still earns its complexity.",
  },
  {
    title: "Agent frameworks: build vs buy",
    excerpt: "We spent three months building our own orchestration layer — in hindsight, mixed feelings.",
  },
  {
    title: "Feedback on the new search page",
    excerpt: "The new layout is a big improvement, but the mobile filters could use some polish.",
  },
];

function seededRandom(seed: number) {
  let t = seed;
  return () => {
    t = (t * 1103515245 + 12345) % 2147483648;
    return t / 2147483648;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function formatActivity(daysAgo: number): string {
  if (daysAgo > 300) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildTopics(count: number): Topic[] {
  const rand = seededRandom(23);
  const topics: Topic[] = [];

  for (let i = 0; i < count; i++) {
    const seed = TOPIC_SEEDS[i % TOPIC_SEEDS.length];
    const category = pick(CATEGORIES, rand);
    const avatarCount = 1 + Math.floor(rand() * 4);
    const avatars = Array.from({ length: avatarCount }, () =>
      String.fromCharCode(65 + Math.floor(rand() * 26))
    );
    const isFirst = i === 0;
    const views = isFirst ? 5000 : Math.floor(rand() * 900);
    const replies = isFirst ? 1 : Math.floor(rand() * 22);
    const daysAgo = isFirst ? 900 : Math.floor(rand() * 200);

    topics.push({
      id: `topic-${i + 1}`,
      title: seed.title,
      excerpt: seed.excerpt,
      category,
      tags: rand() > 0.6 ? [pick(TAGS, rand)] : [],
      replies,
      views,
      activity: formatActivity(daysAgo),
      avatars,
      pinned: isFirst,
      locked: isFirst,
    });
  }

  return topics;
}

const ALL_TOPICS = buildTopics(40);

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function AvatarStack({ initials }: { initials: string[] }) {
  const rand = seededRandom(initials.join("").length + 1);
  return (
    <div className="flex shrink-0 -space-x-2">
      {initials.slice(0, 4).map((letter, i) => (
        <span
          key={i}
          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface text-[10px] font-semibold text-white"
          style={{ backgroundColor: AVATAR_COLORS[Math.floor(rand() * AVATAR_COLORS.length)] }}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}

const TABS = ["Latest", "Hot", "Categories"] as const;
type Tab = (typeof TABS)[number];

export function ForumBoard() {
  const [tab, setTab] = useState<Tab>("Latest");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const topics = useMemo(() => {
    let list = ALL_TOPICS;
    if (tab === "Hot") {
      list = [...list].sort((a, b) => b.views - a.views);
    }
    if (activeCategory) {
      list = list.filter((t) => t.category.name === activeCategory);
    }
    if (activeTag) {
      list = list.filter((t) => t.tags.includes(activeTag));
    }
    return list;
  }, [tab, activeCategory, activeTag]);

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
              {CATEGORIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setActiveCategory(activeCategory === c.name ? null : c.name)}
                  className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                    activeCategory === c.name
                      ? "bg-surface-active text-text-primary"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  }`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-sm"
                    style={{ backgroundColor: c.color }}
                  />
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
              {TAGS.slice(0, 3).map((t) => (
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
                  <AvatarStack initials={topic.avatars} />
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
                  <span className="w-16 text-right text-xs text-text-tertiary">{topic.activity}</span>
                </div>
              </div>
            ))}
          </div>

          {topics.length === 0 && (
            <p className="py-10 text-center text-sm text-text-secondary">
              No topics match this filter.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}