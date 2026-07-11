"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trophy, SearchIcon, ThumbsUp, ThumbsDown } from "lucide-react";
import { SearchEntity } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";

/** Deterministic pseudo-signals, same pattern used across the search
 *  module — stand-ins for fields the real API will eventually provide
 *  directly (starting vote counts). */
function seededInt(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

const PERIODS = ["24h", "7d", "30d"] as const;
type Period = (typeof PERIODS)[number];

function EntityLogo({ entity, size = 36 }: { entity: SearchEntity; size?: number }) {
  const meta = ENTITY_META[entity.type];
  const Icon = meta.icon;

  if (entity.imageUrl) {
    return (
      <Image
        src={entity.imageUrl}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-lg object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: meta.solidColor, width: size, height: size }}
      aria-hidden
    >
      <Icon size={size * 0.5} className="text-white" strokeWidth={2} />
    </div>
  );
}

interface RankingsBoardProps {
  items: SearchEntity[];
  startRank: number;
}

export function RankingsBoard({ items, startRank }: RankingsBoardProps) {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("7d");
  const [voteQuery, setVoteQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [myVotes, setMyVotes] = useState<Record<string, 1 | -1 | undefined>>({});

  function castVote(id: string, direction: 1 | -1) {
    setMyVotes((prev) => ({ ...prev, [id]: prev[id] === direction ? undefined : direction }));
  }

  function submitVoteSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!voteQuery.trim()) return;
    router.push(`/search/results?q=${encodeURIComponent(voteQuery)}`);
  }

  const filtered = useMemo(() => {
    if (!filterQuery.trim()) return items;
    const q = filterQuery.trim().toLowerCase();
    return items.filter((e) => e.title.toLowerCase().includes(q));
  }, [items, filterQuery]);

  // Period changes the sample window used for the base vote counts, giving
  // the toggle a visible (if cosmetic, pending real time-series data) effect.
  const periodMultiplier = period === "24h" ? 0.15 : period === "7d" ? 1 : 3.2;

  return (
    <div>
      {/* Title */}
      <div className="mx-auto mb-6 max-w-xl text-center">
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">AI Tool Rankings</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Top AI tools reviewed this year. Only registered users can vote.
        </p>
      </div>

      {/* Vote card */}
      <form
        onSubmit={submitVoteSearch}
        className="mx-auto mb-8 max-w-xl rounded-xl border border-border bg-surface p-4"
      >
        <p className="mb-2.5 inline-flex items-center gap-1.5 text-sm font-medium text-text-primary">
          <Trophy size={14} className="text-amber-400" />
          Vote for your favorite AI tool
        </p>
        <div className="relative">
          <SearchIcon size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            value={voteQuery}
            onChange={(e) => setVoteQuery(e.target.value)}
            placeholder="Search for your favorite tool…"
            className="w-full rounded-md border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary hover:border-border-hover focus:border-border-hover"
          />
        </div>
      </form>

      {/* Leaderboard heading */}
      <div className="mb-4 text-center">
        <h2 className="text-lg font-semibold text-accent">Leaderboard</h2>
      </div>

      {/* Period toggle */}
      <div className="mb-4 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                period === p ? "bg-text-primary text-bg" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="mx-auto mb-5 max-w-xl">
        <input
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter by tool…"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary hover:border-border-hover focus:border-border-hover"
        />
      </div>

      {/* List */}
      <div className="mx-auto flex max-w-3xl flex-col gap-2.5">
        {filtered.map((entity, index) => {
          const meta = ENTITY_META[entity.type];
          const href = `${meta.basePath}/${entity.slug}`;
          const baseUp = Math.round(
            (Math.round(entity.popularityScore / 25) + seededInt(`${entity.id}-up`, 5, 60)) * periodMultiplier
          );
          const baseDown = Math.round((seededInt(`${entity.id}-down`, 0, 12)) * periodMultiplier);
          const myVote = myVotes[entity.id];
          const upvotes = baseUp + (myVote === 1 ? 1 : 0);
          const downvotes = baseDown + (myVote === -1 ? 1 : 0);

          return (
            <div
              key={entity.id}
              className="group flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 transition-colors hover:border-border-hover sm:gap-4"
            >
              <span className="w-6 shrink-0 text-sm font-medium tabular-nums text-text-tertiary">
                #{startRank + index}
              </span>

              <EntityLogo entity={entity} />

              <Link href={href} className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-sm font-semibold text-text-primary group-hover:text-accent">
                    {entity.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border-hover bg-surface-active px-2 py-0.5 text-[11px] font-medium text-text-primary/80">
                    {entity.category}
                  </span>
                </div>
                <p className="line-clamp-1 text-xs text-text-secondary">{entity.description}</p>
              </Link>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    castVote(entity.id, 1);
                  }}
                  aria-pressed={myVote === 1}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    myVote === 1
                      ? "bg-success/20 text-success"
                      : "bg-success/10 text-success/80 hover:bg-success/20"
                  }`}
                >
                  <ThumbsUp size={12} />
                  {upvotes}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    castVote(entity.id, -1);
                  }}
                  aria-pressed={myVote === -1}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    myVote === -1
                      ? "bg-danger/20 text-danger"
                      : "bg-danger/10 text-danger/80 hover:bg-danger/20"
                  }`}
                >
                  <ThumbsDown size={12} />
                  {downvotes}
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-text-secondary">No tools match “{filterQuery}”.</p>
        )}
      </div>
    </div>
  );
}
