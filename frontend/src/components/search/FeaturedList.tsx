"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Eye, Flame, Star, Tag } from "lucide-react";
import { SearchEntity } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";

/**
 * Deterministic pseudo-signals, same pattern as TrendingList/MiniToolsList —
 * stand-ins for fields the real API will eventually provide directly
 * (discount badge, verified flag, views, votes, rating, pricing).
 */
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

const DISCOUNTS = [0, 0, 0, 10, 15, 20];

function deriveFeaturedSignals(entity: SearchEntity) {
  const views = entity.popularityScore * 8 + seededInt(entity.id, 0, 900);
  const votes = Math.round(entity.popularityScore / 20) + seededInt(`${entity.id}-votes`, 3, 90);
  const rating = (3.6 + seededInt(`${entity.id}-r`, 0, 14) / 10).toFixed(1);
  const verified = seededInt(`${entity.id}-v`, 0, 10) > 5;
  const discount = DISCOUNTS[seededInt(`${entity.id}-d`, 0, DISCOUNTS.length - 1)];
  const monthsAgo = Math.max(0, seededInt(`${entity.id}-m`, 0, 6));
  const priceFrom = typeof entity.priceAmount === "number" && entity.priceAmount > 0
    ? entity.priceAmount
    : [4.99, 8.25, 9, 12, 18, 30][seededInt(`${entity.id}-p`, 0, 5)];
  const isFree = !entity.priceAmount || entity.priceAmount === 0;
  return { views, votes, rating, verified, discount, monthsAgo, priceFrom, isFree };
}

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

interface FeaturedListProps {
  items: SearchEntity[];
}

/**
 * List-view rendering of TAAFT's "Featured" module — same card content
 * (discount ribbon, verified checkmark, category chip, country, release
 * age, views/votes/rating, pricing) as the two-column featured grid, but
 * stacked as single full-width rows so it scales past a handful of items.
 */
export function FeaturedList({ items }: FeaturedListProps) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((entity) => {
        const meta = ENTITY_META[entity.type];
        const href = `${meta.basePath}/${entity.slug}`;
        const { views, votes, rating, verified, discount, monthsAgo, priceFrom, isFree } =
          deriveFeaturedSignals(entity);

        return (
          <div
            key={entity.id}
            className="group relative overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-border-hover"
          >
            {discount > 0 && (
              <span className="absolute left-0 top-0 rounded-br-lg bg-highlight px-2.5 py-1 text-[11px] font-semibold text-highlight-text">
                {discount}% OFF
              </span>
            )}

            <div className="flex flex-col gap-3 p-4 pt-4 sm:flex-row sm:items-center">
              <div className={discount > 0 ? "flex items-start gap-3 sm:mt-0" : "flex items-start gap-3"}>
                <div className={discount > 0 ? "mt-1" : ""}>
                  <EntityLogo entity={entity} />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <Link href={href} className="flex min-w-0 items-center gap-1.5">
                  <h3 className="truncate text-[15px] font-semibold text-text-primary group-hover:text-accent">
                    {entity.title}
                  </h3>
                  {verified && (
                    <BadgeCheck size={15} className="shrink-0 text-accent" aria-label="Verified" />
                  )}
                </Link>

                <p className="mt-0.5 line-clamp-1 text-sm text-text-secondary">{entity.description}</p>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border-hover bg-surface-active px-2.5 py-0.5 text-xs font-medium text-text-primary/80">
                    <Tag size={11} />
                    {entity.category}
                  </span>
                  <span className="text-xs text-text-tertiary">{entity.country}</span>
                  <span className="text-xs text-text-tertiary">
                    Released {monthsAgo === 0 ? "<1mo" : `${monthsAgo}mo`} ago
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border pt-3 sm:justify-end sm:gap-5 sm:border-t-0 sm:pt-0">
                <div className="flex items-center gap-3 text-xs text-text-tertiary">
                  <span className="inline-flex items-center gap-1">
                    <Eye size={12} />
                    {formatCompact(views)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Flame size={12} />
                    {votes}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {rating}
                  </span>
                </div>

                <div className="text-right">
                  <p className={isFree ? "text-sm font-medium text-emerald-400" : "text-sm font-medium text-text-secondary"}>
                    {isFree ? "Free +" : "Paid"}
                  </p>
                  <p className="text-xs text-text-tertiary">from ${priceFrom}/mo</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
