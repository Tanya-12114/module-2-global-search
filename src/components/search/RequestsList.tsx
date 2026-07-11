"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon, Plus, MessageSquare } from "lucide-react";
import { SearchEntity } from "@/types/entities";

/**
 * Deterministic pseudo-signals derived from popularityScore + id, standing in
 * for fields the real API will eventually provide directly (vote count,
 * answer count, requester identity). Same entity always produces the same
 * numbers/names.
 */
function seededInt(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

const FIRST_NAMES = [
  "Ezekiel", "Innocent", "Fatema", "Wei", "Sofia", "Liam", "Amara", "Noah",
  "Priya", "Diego", "Chen", "Layla", "Marcus", "Aisha", "Tom", "Nina",
  "Omar", "Grace", "Kwame", "Elena",
];
const LAST_NAMES = [
  "Snyders", "Maredi", "Naveed", "Chen", "Rossi", "Park", "Okafor", "Silva",
  "Kapoor", "Ramirez", "Wu", "Haddad", "Bennett", "Khan", "Novak", "Alvarez",
  "Diallo", "Murphy", "Osei", "Petrov",
];
const AVATAR_COLORS = [
  "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
];

function deriveRequestSignals(entity: SearchEntity) {
  const votes = Math.max(1, Math.round(entity.popularityScore / 55) + seededInt(`${entity.id}-rv`, 0, 12));
  const daysAgo = Math.max(
    0,
    Math.round((Date.now() - new Date(entity.createdAt).getTime()) / 86_400_000)
  );
  const answerRoll = seededInt(`${entity.id}-ra`, 0, 9);
  const answers = answerRoll < 6 ? 0 : answerRoll - 5;
  const firstName = FIRST_NAMES[seededInt(`${entity.id}-fn`, 0, FIRST_NAMES.length - 1)];
  const lastName = LAST_NAMES[seededInt(`${entity.id}-ln`, 0, LAST_NAMES.length - 1)];
  const avatarColor = AVATAR_COLORS[seededInt(`${entity.id}-ac`, 0, AVATAR_COLORS.length - 1)];
  return { votes, daysAgo, answers, authorName: `${firstName} ${lastName}`, avatarColor };
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

export function RequestsList({ items }: RequestsListProps) {
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
        {filtered.map((entity) => {
          const { votes, daysAgo, answers, authorName, avatarColor } = deriveRequestSignals(entity);
          const voted = !!myVotes[entity.id];
          const displayVotes = votes + (voted ? 1 : 0);
          const initial = authorName.charAt(0).toUpperCase();
          const timeLabel = daysAgo <= 0 ? "today" : `${daysAgo}d ago`;

          return (
            <div key={entity.id} className="flex items-stretch gap-3">
              {/* Vote box */}
              <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-surface px-2 py-4 text-center">
                <p className="text-2xl font-bold leading-none tabular-nums text-text-primary">
                  {displayVotes}
                </p>
                <p className="text-[11px] text-text-tertiary">{displayVotes === 1 ? "vote" : "votes"}</p>
                <p className="text-[11px] text-text-tertiary">
                  {answers} {answers === 1 ? "answer" : "answers"}
                </p>
                <button
                  type="button"
                  onClick={() => toggleVote(entity.id)}
                  aria-pressed={voted}
                  aria-label={`Upvote ${entity.title}`}
                  className={`mt-2 w-full rounded-md px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                    voted
                      ? "bg-warning/40 text-warning"
                      : "bg-warning text-black hover:bg-warning/90"
                  }`}
                >
                  Vote
                </button>
              </div>

              {/* Content card */}
              <div className="group flex min-w-0 flex-1 items-center rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-hover">
                <div className="min-w-0 flex-1">
                  <Link href="#" className="block">
                    <h3 className="text-[17px] font-bold leading-snug text-text-primary group-hover:text-accent">
                      {entity.title}
                    </h3>
                  </Link>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                    <span className="rounded-full bg-surface-active px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                      AI Tools
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {initial}
                      </span>
                      <span className="text-text-secondary">{authorName}</span>
                    </span>
                    <span>· {timeLabel}</span>
                  </div>
                </div>
              </div>
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
