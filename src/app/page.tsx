"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Wrench, Building2, BrainCircuit, Newspaper, Layers, MoreHorizontal } from "lucide-react";
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
      <section className="hero-glow">
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-secondary">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-highlight)" }}
            />
            The front page for everything AI
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            Find the right AI tool,
            <br className="hidden sm:block" /> before you build the wrong one.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-text-secondary">
            Search across tools, companies, models, news, and repositories —
            all in one place.
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <HeroSearchTrigger />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/search"
              className="btn-neopop rounded-md px-4 py-2 text-sm font-medium"
            >
              Browse everything
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 px-1">
            {CATEGORY_SHORTCUTS.map(({ icon: Icon, label, type }) => (
              <Link
                key={type}
                href={`/search?types=${type}`}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
              >
                <Icon size={14} />
                {label}
                {counts[type] !== undefined && (
                  <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-xs font-medium tabular-nums text-text-secondary">
                    {counts[type]!.toLocaleString()}
                  </span>
                )}
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
                <div className="absolute left-[calc(100%+8px)] top-1/2 z-30 max-h-72 w-56 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-surface p-1.5 text-left shadow-xl shadow-black/40">
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
                          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-xs font-medium tabular-nums text-text-secondary">
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

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
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