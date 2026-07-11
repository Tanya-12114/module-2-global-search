"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ChevronDown,
  ThumbsUp,
  Heart,
  Bookmark,
  Circle,
} from "lucide-react";
import { SearchEntity } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";
import { REVIEWER_NAMES, REVIEW_QUOTES } from "@/lib/mockData";

/** Deterministic pseudo-signals, same pattern used across the search
 *  module — stand-ins for fields the real API will eventually provide
 *  directly (thumbnail, reviewer quote, social counts). */
function seededInt(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

function deriveReleaseSignals(entity: SearchEntity) {
  const thumbsUp = Math.round(entity.popularityScore / 40) + seededInt(`${entity.id}-tu`, 0, 30);
  const hearts = seededInt(`${entity.id}-h`, 0, 20);
  const saves = seededInt(`${entity.id}-sv`, 0, 40);
  const reviewer = REVIEWER_NAMES[seededInt(`${entity.id}-rev`, 0, REVIEWER_NAMES.length - 1)];
  const quote = REVIEW_QUOTES[seededInt(`${entity.id}-q`, 0, REVIEW_QUOTES.length - 1)];
  const hasQuote = seededInt(`${entity.id}-hq`, 0, 10) > 3;
  const hasThumbnail = seededInt(`${entity.id}-th`, 0, 10) > 2;
  const thumbnail = `https://picsum.photos/seed/${entity.id}-shot/200/130`;
  const daysAgo = Math.max(0, Math.round((Date.now() - new Date(entity.createdAt).getTime()) / 86_400_000));
  return { thumbsUp, hearts, saves, reviewer, quote, hasQuote, hasThumbnail, thumbnail, daysAgo };
}

const TIME_FILTERS = ["Just released", "This week", "This month"];

function EntityLogo({ entity, size = 40 }: { entity: SearchEntity; size?: number }) {
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
      <Icon size={size * 0.45} className="text-white" strokeWidth={2} />
    </div>
  );
}

function ReviewerAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  const hue = seededInt(name, 0, 360);
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: `hsl(${hue}, 45%, 42%)` }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

interface NewReleasesListProps {
  items: SearchEntity[];
  startRank: number;
}

export function NewReleasesList({ items, startRank }: NewReleasesListProps) {
  const [timeFilter, setTimeFilter] = useState(TIME_FILTERS[0]);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="mb-2 flex flex-wrap items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Sparkles size={16} />
        </span>
        <h1 className="text-lg font-semibold text-text-primary">AI Tools released in</h1>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-hover bg-surface-active px-3 py-1 text-sm font-medium text-text-primary hover:border-border-hover"
          >
            {timeFilter}
            <ChevronDown size={13} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 min-w-[10rem] overflow-hidden rounded-md border border-border bg-surface shadow-lg">
              {TIME_FILTERS.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setTimeFilter(option);
                    setMenuOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                    option === timeFilter
                      ? "bg-accent-soft text-accent"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mb-5 text-sm text-text-secondary">
        Browse the freshest additions to the directory — the complete list of AI tools released{" "}
        {timeFilter.toLowerCase()}, newest first.
      </p>

      {/* List */}
      <div className="flex flex-col gap-3">
        {items.map((entity, index) => {
          const meta = ENTITY_META[entity.type];
          const href = `${meta.basePath}/${entity.slug}`;
          const { thumbsUp, hearts, saves, reviewer, quote, hasQuote, hasThumbnail, thumbnail, daysAgo } =
            deriveReleaseSignals(entity);

          return (
            <div
              key={entity.id}
              className="group rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-hover"
            >
              <div className="flex gap-3 sm:gap-4">
                <div className="flex w-6 shrink-0 justify-end pt-1 text-sm tabular-nums text-text-tertiary">
                  {startRank + index}
                </div>

                <EntityLogo entity={entity} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                    <Link href={href} className="flex min-w-0 items-center gap-1.5">
                      <h3 className="truncate text-[15px] font-semibold text-text-primary group-hover:text-accent">
                        {entity.title}
                      </h3>
                      <span className="shrink-0 rounded-full bg-highlight px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-highlight-text">
                        New
                      </span>
                    </Link>

                    <span className="shrink-0 text-xs text-text-tertiary">
                      Released {daysAgo === 0 ? "today" : `${daysAgo}d ago`}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border-hover bg-surface-active px-2.5 py-0.5 text-xs font-medium text-text-primary/80">
                      <Circle size={7} className="fill-accent text-accent" />
                      {entity.category}
                    </span>
                    {entity.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-border-hover bg-surface-active px-2.5 py-0.5 text-xs font-medium text-text-primary/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      {hasQuote && (
                        <div className="flex items-start gap-2">
                          <ReviewerAvatar name={reviewer} />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-text-primary">{reviewer}</p>
                            <p className="line-clamp-2 text-xs text-text-secondary">{quote}</p>
                          </div>
                        </div>
                      )}
                      {!hasQuote && (
                        <p className="line-clamp-2 text-xs text-text-secondary">{entity.description}</p>
                      )}
                    </div>

                    {hasThumbnail && (
                      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-surface-active sm:h-14 sm:w-24">
                        <Image src={thumbnail} alt="" fill sizes="96px" className="object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-4 border-t border-border pt-2.5 text-xs text-text-tertiary">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp size={12} />
                      {thumbsUp}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart size={12} />
                      {hearts}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bookmark size={12} />
                      {saves}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
