"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SearchEntity } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";

/** Deterministic pseudo-signals, same pattern used across the search
 *  module — stand-ins for fields the real API will eventually provide
 *  directly (tagline color variant, comment count, portrait photo). */
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

function deriveCharacterSignals(entity: SearchEntity) {
  const comments = Math.round(entity.popularityScore / 6) + seededInt(`${entity.id}-cm`, 0, 200);
  const portrait = `https://picsum.photos/seed/${entity.id}-portrait/160/160`;
  return { comments, portrait };
}

function Avatar({ entity, portrait }: { entity: SearchEntity; portrait: string }) {
  const meta = ENTITY_META[entity.type];
  const Icon = meta.icon;

  if (entity.imageUrl) {
    return (
      <Image
        src={entity.imageUrl}
        alt=""
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-surface-active">
      <Image src={portrait} alt="" fill sizes="56px" className="object-cover" />
      <div
        className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border border-surface"
        style={{ backgroundColor: meta.solidColor }}
        aria-hidden
      >
        <Icon size={9} className="text-white" strokeWidth={2.5} />
      </div>
    </div>
  );
}

interface CharactersGridProps {
  items: SearchEntity[];
}

export function CharactersGrid({ items }: CharactersGridProps) {
  const meta = ENTITY_META.robot;

  return (
    <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
      {items.map((entity) => {
        const href = `${meta.basePath}/${entity.slug}`;
        const { comments, portrait } = deriveCharacterSignals(entity);

        return (
          <Link
            key={entity.id}
            href={href}
            className="group flex items-start gap-3.5 p-4 transition-colors hover:bg-surface-hover sm:items-center"
          >
            <Avatar entity={entity} portrait={portrait} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h3 className="truncate text-sm font-semibold text-text-primary group-hover:text-accent">
                  {entity.title}
                </h3>
                <span className="truncate text-xs text-accent-hover">{entity.category}</span>
              </div>

              <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-text-secondary sm:line-clamp-1">
                {entity.description}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {entity.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-surface-active px-2 py-0.5 text-[11px] font-medium text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="ml-2 flex shrink-0 items-center gap-1 text-xs text-text-tertiary">
              <MessageCircle size={12} />
              {formatCompact(comments)}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
