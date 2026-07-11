"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, ThumbsUp, ThumbsDown, Eye, Star, Zap } from "lucide-react";
import { SearchEntity } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";
import { Badge } from "@/components/ui/Badge";
import { REVIEWER_NAMES, REVIEW_QUOTES } from "@/lib/mockData";

/** Deterministic pseudo-signals, same pattern as TrendingList — stand-ins
 *  for fields the real API will eventually provide directly. */
function seededInt(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function deriveGallerySignals(entity: SearchEntity) {
  const views = entity.popularityScore * 8 + seededInt(entity.id, 0, 900);
  const saves = Math.round(entity.popularityScore / 12) + seededInt(`${entity.id}-s`, 0, 60);
  const rating = (3.6 + seededInt(`${entity.id}-r`, 0, 14) / 10).toFixed(1);
  const reviewerUp = seededInt(`${entity.id}-tup`, 1, 320);
  const reviewerDown = seededInt(`${entity.id}-tdown`, 0, 40);
  const reviewer = REVIEWER_NAMES[seededInt(`${entity.id}-rev`, 0, REVIEWER_NAMES.length - 1)];
  const karma = seededInt(`${entity.id}-karma`, 8, 900);
  const quote = REVIEW_QUOTES[seededInt(`${entity.id}-q`, 0, REVIEW_QUOTES.length - 1)];
  const imageCount = seededInt(`${entity.id}-imgs`, 3, 6);
  const images = Array.from({ length: imageCount }, (_, i) => `https://picsum.photos/seed/${entity.id}-${i}/200/200`);
  const releasedYearsAgo = Math.max(0, seededInt(`${entity.id}-yrs`, 0, 3));
  return { views, saves, rating, reviewerUp, reviewerDown, reviewer, karma, quote, images, releasedYearsAgo };
}

function EntityLogo({ entity, size = 36 }: { entity: SearchEntity; size?: number }) {
  const meta = ENTITY_META[entity.type];
  const Icon = meta.icon;
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

function ReviewerAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  const hue = seededInt(name, 0, 360);
  return (
    <div
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: `hsl(${hue}, 45%, 42%)` }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

interface MiniToolsListProps {
  items: SearchEntity[];
}

export function MiniToolsList({ items }: MiniToolsListProps) {
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  function toggleBookmark(id: string) {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((entity) => {
        const meta = ENTITY_META[entity.type];
        const href = `${meta.basePath}/${entity.slug}`;
        const pricing = typeof entity.meta.pricing === "string" ? entity.meta.pricing : "Free";
        const {
          views,
          saves,
          rating,
          reviewerUp,
          reviewerDown,
          reviewer,
          karma,
          quote,
          images,
          releasedYearsAgo,
        } = deriveGallerySignals(entity);
        const isSaved = bookmarked.has(entity.id);

        return (
          <div
            key={entity.id}
            className="relative rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-hover"
          >
            <button
              onClick={() => toggleBookmark(entity.id)}
              aria-label={isSaved ? "Remove bookmark" : "Add bookmark"}
              aria-pressed={isSaved}
              className="absolute right-4 top-4 text-text-tertiary hover:text-text-primary"
            >
              <Bookmark size={16} className={isSaved ? "fill-accent text-accent" : ""} />
            </button>

            <Link href={href} className="group flex items-center gap-2.5 pr-8">
              <EntityLogo entity={entity} />
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-semibold text-text-primary group-hover:text-accent">
                  {entity.title}
                </h3>
                <Badge>{entity.category}</Badge>
              </div>
            </Link>

            {/* Image carousel */}
            <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
              {images.map((src, i) => (
                <div
                  key={i}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-surface-active"
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </div>
              ))}
            </div>

            {/* Reviewer row */}
            <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
              <ReviewerAvatar name={reviewer} />
              <span className="font-medium text-text-primary">{reviewer}</span>
              <span className="inline-flex items-center gap-0.5 text-text-tertiary">
                <Zap size={11} />
                {karma}
              </span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-sm text-text-secondary">{quote}</p>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-text-tertiary">
              <span className="inline-flex items-center gap-1">
                <ThumbsUp size={12} />
                {reviewerUp}
              </span>
              <span className="inline-flex items-center gap-1">
                <ThumbsDown size={12} />
                {reviewerDown}
              </span>
            </div>

            {/* Footer */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-t border-border pt-2.5 text-xs">
              <div className="flex items-center gap-3">
                <span
                  className={
                    pricing === "Free"
                      ? "font-medium text-emerald-400"
                      : "font-medium text-text-secondary"
                  }
                >
                  {pricing}
                </span>
                <span className="text-text-tertiary">
                  Released {releasedYearsAgo === 0 ? "<1y" : `${releasedYearsAgo}y`} ago
                </span>
              </div>
              <div className="flex items-center gap-3 text-text-tertiary">
                <span className="inline-flex items-center gap-1">
                  <Eye size={12} />
                  {formatCompact(views)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {rating}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Bookmark size={12} />
                  {formatCompact(saves)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
