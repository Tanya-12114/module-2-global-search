"use client";

import Image from "next/image";
import Link from "next/link";
import { Bot, ThumbsUp, MessageCircle, Circle } from "lucide-react";
import { SearchEntity } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";
import { REVIEWER_NAMES } from "@/lib/mockData";

/** Deterministic pseudo-signals, same pattern used across the search
 *  module — stand-ins for fields the real API will eventually provide
 *  directly (thumbnail, thumbnail height, reviewer, votes/comments). */
function seededInt(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

function deriveAgentSignals(entity: SearchEntity) {
  const thumbHeight = seededInt(`${entity.id}-th`, 100, 220);
  const thumbnail = `https://picsum.photos/seed/${entity.id}-agent/320/${thumbHeight}`;
  const thumbsUp = Math.round(entity.popularityScore / 50) + seededInt(`${entity.id}-tu`, 0, 20);
  const comments = seededInt(`${entity.id}-c`, 0, 60);
  const hasReviewer = seededInt(`${entity.id}-hr`, 0, 10) > 5;
  const reviewer = REVIEWER_NAMES[seededInt(`${entity.id}-rev`, 0, REVIEWER_NAMES.length - 1)];
  const daysAgo = Math.max(0, Math.round((Date.now() - new Date(entity.createdAt).getTime()) / 86_400_000));
  return { thumbHeight, thumbnail, thumbsUp, comments, hasReviewer, reviewer, daysAgo };
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

function EntityLogo({ entity, size = 28 }: { entity: SearchEntity; size?: number }) {
  const meta = ENTITY_META[entity.type];
  const Icon = meta.icon;

  if (entity.imageUrl) {
    return (
      <Image
        src={entity.imageUrl}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-md object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-md"
      style={{ backgroundColor: meta.solidColor, width: size, height: size }}
      aria-hidden
    >
      <Icon size={size * 0.55} className="text-white" strokeWidth={2} />
    </div>
  );
}

interface AgentsGridProps {
  items: SearchEntity[];
}

export function AgentsGrid({ items }: AgentsGridProps) {
  const meta = ENTITY_META.tool;

  return (
    <div>
      <div className="relative mb-6 flex items-center justify-center">
        <span className="absolute left-0 rounded-full bg-highlight px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-highlight-text">
          Just released
        </span>
        <h1 className="inline-flex items-center gap-2 text-lg font-semibold text-text-primary">
          <Bot size={18} className="text-accent" />
          Agents
        </h1>
      </div>

      <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
        {items.map((entity) => {
          const href = `${meta.basePath}/${entity.slug}`;
          const { thumbHeight, thumbnail, thumbsUp, comments, hasReviewer, reviewer, daysAgo } =
            deriveAgentSignals(entity);

          return (
            <Link
              key={entity.id}
              href={href}
              className="group mb-3 block break-inside-avoid overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-border-hover"
            >
              <div className="relative w-full overflow-hidden bg-surface-active" style={{ height: thumbHeight }}>
                <Image src={thumbnail} alt="" fill sizes="320px" className="object-cover" />
              </div>

              <div className="p-3">
                <div className="flex items-start gap-2">
                  <EntityLogo entity={entity} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold text-text-primary group-hover:text-accent">
                        {entity.title}
                      </h3>
                      <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-text-tertiary">
                        <MessageCircle size={11} />
                        {comments}
                      </span>
                    </div>
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded-full border border-border-hover bg-surface-active px-2 py-0.5 text-[11px] font-medium text-text-primary/80">
                      <Circle size={6} className="fill-accent text-accent" />
                      {entity.category}
                    </span>
                  </div>
                </div>

                {hasReviewer ? (
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <ReviewerAvatar name={reviewer} />
                    <span className="truncate text-xs text-text-secondary">{reviewer}</span>
                  </div>
                ) : (
                  <p className="mt-2.5 line-clamp-2 text-xs text-text-secondary">{entity.description}</p>
                )}

                <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2 text-xs text-text-tertiary">
                  <span>Released {daysAgo === 0 ? "today" : `${daysAgo}d ago`}</span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp size={12} />
                    {thumbsUp}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
