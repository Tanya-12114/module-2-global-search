"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Wrench, Building2, BrainCircuit, Newspaper, Layers, MoreHorizontal, Flame } from "lucide-react";
import { HeroSearchTrigger } from "@/components/search/HeroSearchTrigger";
import { getEntityTypeCounts } from "@/lib/api";
import { ALL_ENTITY_TYPES, ENTITY_META } from "@/lib/entityMeta";
import { EntityType } from "@/types/entities";

const CATEGORY_SHORTCUTS = [
  { icon: Wrench, label: "AI Tools", type: "tool" as EntityType },
  { icon: Building2, label: "Companies", type: "company" as EntityType },
  { icon: BrainCircuit, label: "Models", type: "model" as EntityType },
  { icon: Newspaper, label: "News", type: "news" as EntityType },
  { icon: Layers, label: "Collections", type: "collection" as EntityType },
];

const SHORTCUT_TYPES = new Set(CATEGORY_SHORTCUTS.map((s) => s.type));
const OVERFLOW_TYPES = ALL_ENTITY_TYPES.filter((t) => !SHORTCUT_TYPES.has(t));

// TAAFT's real homepage leads with task-flavored shortcuts ("Generate images",
// "Create AI Tools", "YouTube Summarize"...) rather than plain entity names —
// each one a colorful little pill you can scan at a glance.
const TASK_SHORTCUTS = [{ label: "Generate images" }, { label: "Create AI Tools" }];

export default function Home() {
  const [counts, setCounts] = useState<Partial<Record<EntityType, number>>>({});
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getEntityTypeCounts({ q: "", categories: [] }).then((result) => {
      if (!cancelled) setCounts(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setIsOverflowOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Promo banner — TAAFT's full-width red "join for free" strip */}
      <Link
        href="#"
        className="block bg-banner px-4 py-2 text-center text-xs font-medium text-banner-text transition-opacity hover:opacity-90 sm:text-sm"
      >
        Click here to join for free!
      </Link>

      <section className="hero-glow">
        <div className="mx-auto max-w-4xl px-4 pb-12 pt-12 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-text-tertiary">taaft.com/any-keyword</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            The front page of AI.
            <br className="hidden sm:block" /> Used by 90M+ humans.
          </h1>

          {/* Spotlight pill — TAAFT always leads with one hand-picked featured tool */}
          <Link
            href="/tools/spotlight"
            className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-border bg-transparent py-1.5 pl-1.5 pr-3 text-xs text-text-secondary transition-colors hover:border-border-hover sm:text-sm"
          >
            <span className="rounded-full bg-highlight px-2.5 py-1 text-[11px] font-semibold text-highlight-text">
              Spotlight
            </span>
            <span className="truncate text-text-primary">
              SureThing.io — &ldquo;OpenClaw&rdquo; for beginners
            </span>
            <span className="hidden rounded-full border border-border-hover px-2 py-0.5 text-[11px] text-text-secondary sm:inline">
              Task automation
            </span>
          </Link>

          <div className="mx-auto mt-5 max-w-xl">
            <HeroSearchTrigger />
          </div>

          <p className="mx-auto mt-4 flex items-center justify-center gap-1.5 text-sm text-text-secondary">
            The front page of AI. Used by 90M+ humans.
            <span className="hidden items-center gap-1 text-text-tertiary sm:flex">
              <Flame size={12} className="text-accent" />
              79,552 searches today
            </span>
          </p>

          {/* Uniform outlined pill row, TAAFT-style — "Generate images" / "Create AI Tools" up top */}
          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2">
            {TASK_SHORTCUTS.map(({ label }) => (
              <Link
                key={label}
                href={`/search?q=${encodeURIComponent(label)}`}
                className="whitespace-nowrap rounded-full border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-border-hover hover:bg-surface-hover"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-1.5 px-1">
            {CATEGORY_SHORTCUTS.map(({ icon: Icon, label, type }, i) => (
              <Link
                key={type}
                href={`/search?types=${type}`}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  i === 0
                    ? "border-selected bg-selected text-white"
                    : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}

            <div ref={overflowRef} className="relative shrink-0">
              <button
                onClick={() => setIsOverflowOpen((v) => !v)}
                aria-label="More entity types"
                aria-expanded={isOverflowOpen}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isOverflowOpen
                    ? "border-accent bg-accent-soft text-text-primary"
                    : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
                }`}
              >
                <MoreHorizontal size={16} />
              </button>

              {isOverflowOpen && (
                <div className="absolute left-[calc(100%+8px)] top-1/2 z-30 max-h-72 w-56 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-bg p-1.5 text-left shadow-xl shadow-black/10">
                  {OVERFLOW_TYPES.map((type) => {
                    const meta = ENTITY_META[type];
                    const Icon = meta.icon;
                    return (
                      <Link
                        key={type}
                        href={`/search?types=${type}`}
                        onClick={() => setIsOverflowOpen(false)}
                        className="flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                      >
                        <span className="flex items-center gap-2">
                          <Icon size={14} />
                          {meta.plural}
                        </span>
                        {counts[type] !== undefined && (
                          <span className="rounded-full bg-surface-active px-1.5 py-0.5 text-xs font-medium tabular-nums text-text-secondary">
                            {counts[type]!.toLocaleString()}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip — TAAFT's "Tools 50,511  Companies 7,246 ..." row, as proper cards */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-2.5 px-4 py-5 sm:px-6 lg:px-8">
          {ALL_ENTITY_TYPES.map((type) => {
            const meta = ENTITY_META[type];
            const Icon = meta.icon;
            const count = counts[type];
            return (
              <Link
                key={type}
                href={`/search?types=${type}`}
                className="group flex items-center gap-2 rounded-lg border border-border bg-input-bg px-3.5 py-2 text-sm shadow-sm shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md hover:shadow-black/20"
              >
                <Icon size={14} className="shrink-0 text-text-tertiary transition-colors group-hover:text-accent" />
                <span className="font-medium text-text-primary">{meta.plural}</span>
                <span className="rounded-full bg-surface-active px-1.5 py-0.5 text-xs font-medium tabular-nums text-text-secondary">
                  {count !== undefined ? count.toLocaleString() : "—"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoCard
            title="Search everything at once"
            description="One query, results across every entity type on the platform — no switching tabs."
          />
          <InfoCard
            title="Filter down fast"
            description="Narrow by type, category, and sort by relevance, popularity, or recency."
          />
          <InfoCard
            title="Pick up where you left off"
            description="Recent and popular searches are one click away, every time you come back."
          />
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-sm font-medium text-text-primary">{title}</h3>
      <p className="mt-1.5 text-sm text-text-secondary">{description}</p>
    </div>
  );
}