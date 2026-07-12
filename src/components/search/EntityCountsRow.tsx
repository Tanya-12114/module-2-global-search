"use client";

import { useState } from "react";
import Link from "next/link";
import { ALL_ENTITY_TYPES, ENTITY_META } from "@/lib/entityMeta";
import { MOCK_ENTITIES } from "@/lib/mockData";

const VISIBLE_COUNT = 6;

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(n);
}

export function EntityCountsRow({ className = "" }: { className?: string }) {
  const [expanded, setExpanded] = useState(false);

  const counts = ALL_ENTITY_TYPES.map((type) => ({
    type,
    meta: ENTITY_META[type],
    count: MOCK_ENTITIES.filter((e) => e.type === type).length,
  }));

  const shown = expanded ? counts : counts.slice(0, VISIBLE_COUNT);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {shown.map(({ type, meta, count }) => (
        <Link
          key={type}
          href={`/search/results?types=${type}`}
          className="flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-text-primary transition-colors hover:border-border-hover"
        >
          {meta.plural}
          <span className="rounded-full bg-surface-active px-1.5 py-0.5 text-xs font-normal text-text-tertiary">
            {formatCount(count)}
          </span>
        </Link>
      ))}
      {!expanded && counts.length > VISIBLE_COUNT && (
        <button
          onClick={() => setExpanded(true)}
          aria-label="Show more categories"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
        >
          •••
        </button>
      )}
    </div>
  );
}
