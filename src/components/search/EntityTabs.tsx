"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EntityType } from "@/types/entities";
import { ALL_ENTITY_TYPES, ENTITY_META } from "@/lib/entityMeta";

interface EntityTabsProps {
  selected: EntityType[];
  onChange: (types: EntityType[]) => void;
  counts?: Partial<Record<EntityType, number>>;
}

export function EntityTabs({ selected, onChange, counts }: EntityTabsProps) {
  const isAll = selected.length === 0;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts, selected.length]);

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  function toggle(type: EntityType) {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  }

  const totalCount = counts
    ? Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0)
    : undefined;

  return (
    <div className="relative">
      {canScrollLeft && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-[var(--color-bg)] to-transparent" />
          <button
            aria-label="Scroll categories left"
            onClick={() => scrollBy(-160)}
            className="absolute left-0.5 top-1/2 z-20 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-md hover:text-text-primary"
          >
            <ChevronLeft size={14} />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className={`scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 transition-[padding] ${
          canScrollLeft ? "pl-9" : ""
        } ${canScrollRight ? "pr-9" : ""}`}
      >
        <TabButton active={isAll} onClick={() => onChange([])}>
          All
          {totalCount !== undefined && <CountBadge active={isAll}>{totalCount}</CountBadge>}
        </TabButton>
        {ALL_ENTITY_TYPES.map((type) => (
          <TabButton key={type} active={selected.includes(type)} onClick={() => toggle(type)}>
            {ENTITY_META[type].plural}
            {counts?.[type] !== undefined && (
              <CountBadge active={selected.includes(type)}>{counts[type]!}</CountBadge>
            )}
          </TabButton>
        ))}
      </div>

      {canScrollRight && (
        <>
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-[var(--color-bg)] to-transparent" />
          <button
            aria-label="Scroll categories right"
            onClick={() => scrollBy(160)}
            className="absolute right-0.5 top-1/2 z-20 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-md hover:text-text-primary"
          >
            <ChevronRight size={14} />
          </button>
        </>
      )}
    </div>
  );
}

function CountBadge({ children, active }: { children: number; active: boolean }) {
  return (
    <span
      className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums ${
        active ? "bg-accent/15 text-accent" : "bg-surface-active text-text-secondary"
      }`}
    >
      {children.toLocaleString()}
    </span>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? "border-accent bg-accent-soft text-text-primary"
          : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}
