"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  SearchIcon,
  Wrench,
  Tag as TagIcon,
  Plus,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { SearchEntity } from "@/types/entities";

/**
 * Deterministic pseudo-signals derived from popularityScore + id, standing in
 * for fields the real API will eventually provide directly (vote count,
 * fulfilled/open status). Same entity always produces the same numbers.
 */
function seededInt(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

type RequestStatus = "open" | "fulfilled";

function deriveRequestSignals(entity: SearchEntity) {
  const votes = Math.max(1, Math.round(entity.popularityScore / 55) + seededInt(`${entity.id}-rv`, 0, 12));
  const daysAgo = Math.max(
    0,
    Math.round((Date.now() - new Date(entity.createdAt).getTime()) / 86_400_000)
  );
  const status: RequestStatus = seededInt(`${entity.id}-rs`, 0, 10) > 7 ? "fulfilled" : "open";
  const extraTags = seededInt(`${entity.id}-rt`, 0, 4);
  return { votes, daysAgo, status, extraTags };
}

function StatusBadge({ daysAgo, status }: { daysAgo: number; status: RequestStatus }) {
  if (status === "fulfilled") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success">
        <CheckCircle2 size={11} />
        Fulfilled
      </span>
    );
  }
  if (daysAgo <= 3) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-warning/15 px-2.5 py-1 text-[11px] font-semibold text-warning">
        NEW
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-surface-active px-2.5 py-1 text-[11px] font-medium text-text-tertiary">
      {daysAgo}d
    </span>
  );
}

const TABS = ["All", "My requests"] as const;
type Tab = (typeof TABS)[number];

/** Decorative site-wide stat — mirrors the "requests fulfilled" counter on
 *  the reference design. Not tied to the current page's result count. */
const FULFILLED_COUNT = 1470;

interface RequestsListProps {
  items: SearchEntity[];
  startRank: number;
}

export function RequestsList({ items, startRank }: RequestsListProps) {
  const [tab, setTab] = useState<Tab>("All");
  const [query, setQuery] = useState("");
  const [myVotes, setMyVotes] = useState<Record<string, boolean>>({});

  function toggleVote(id: string) {
    setMyVotes((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const filtered = useMemo(() => {
    let list = items;
    if (tab === "My requests") {
      list = list.filter((entity) => myVotes[entity.id]);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((entity) => entity.title.toLowerCase().includes(q));
    }
    return list;
  }, [items, tab, myVotes, query]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <MessageSquare size={18} />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">AI Tool Requests</h1>
            <p className="max-w-md text-sm text-text-secondary">
              Looking for a specific AI tool? Post a request and someone will help you find it —
              the community might even build it.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 rounded-xl border border-border bg-surface px-5 py-3">
          <div className="text-center">
            <p className="text-xl font-semibold tabular-nums text-text-primary">
              {FULFILLED_COUNT.toLocaleString()}
            </p>
            <p className="text-[11px] text-text-tertiary">requests fulfilled</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-text-primary px-3.5 py-2 text-xs font-semibold text-bg transition-colors hover:bg-accent hover:text-white"
          >
            <Plus size={13} />
            View request
          </button>
        </div>
      </div>

      {/* Tabs + search */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                tab === t ? "bg-text-primary text-bg" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative">
          <SearchIcon
            size={13}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search requests…"
            className="w-56 rounded-full border border-border bg-surface py-1.5 pl-8 pr-3 text-xs text-text-primary outline-none placeholder:text-text-tertiary hover:border-border-hover focus:border-border-hover"
          />
        </div>
      </div>

      {/* List */}
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {filtered.map((entity, index) => {
          const { votes, daysAgo, status, extraTags } = deriveRequestSignals(entity);
          const voted = !!myVotes[entity.id];
          const displayVotes = votes + (voted ? 1 : 0);

          return (
            <div
              key={entity.id}
              className="group flex items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-hover sm:gap-4"
            >
              <div className="hidden w-5 shrink-0 justify-end pt-2 text-xs tabular-nums text-text-tertiary sm:flex">
                {startRank + index}
              </div>

              <button
                type="button"
                onClick={() => toggleVote(entity.id)}
                aria-pressed={voted}
                aria-label={`Upvote ${entity.title}`}
                className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold tabular-nums transition-colors ${
                  voted
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
                }`}
              >
                <ArrowUp size={13} />
                {displayVotes}
              </button>

              <div className="min-w-0 flex-1">
                <Link href="#" className="block">
                  <h3 className="text-[15px] font-semibold leading-snug text-text-primary group-hover:text-accent">
                    {entity.title}
                  </h3>
                </Link>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border-hover bg-surface-active px-2.5 py-0.5 text-[11px] font-medium text-text-primary/80">
                    <Wrench size={10} />
                    AI tool
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border-hover bg-surface-active px-2.5 py-0.5 text-[11px] font-medium text-text-primary/80">
                    <TagIcon size={10} />
                    {entity.category}
                  </span>
                  {extraTags > 0 && (
                    <span className="rounded-full border border-border-hover bg-surface-active px-2.5 py-0.5 text-[11px] text-text-tertiary">
                      +{extraTags} tags
                    </span>
                  )}
                </div>
              </div>

              <StatusBadge daysAgo={daysAgo} status={status} />
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-text-secondary">
            {tab === "My requests"
              ? "You haven't voted on any requests yet."
              : `No requests match "${query}".`}
          </p>
        )}
      </div>
    </div>
  );
}