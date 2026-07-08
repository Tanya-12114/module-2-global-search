"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SECTIONS, SectionKey } from "@/components/search/SearchHero";

interface SectionTabsRowProps {
  active: SectionKey;
  onSelect: (key: SectionKey) => void;
  /** Real counts, where we have them (e.g. Collections, Tasks map to a real entity type). */
  counts?: Partial<Record<SectionKey, number>>;
}

export function SectionTabsRow({ active, onSelect, counts }: SectionTabsRowProps) {
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
  }, []);

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-[var(--color-bg)] to-transparent" />
          <button
            aria-label="Scroll options left"
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
        {SECTIONS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          const count = counts?.[key];
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                isActive
                  ? "border-accent bg-accent-soft text-text-primary"
                  : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
              }`}
            >
              <Icon size={14} />
              {label}
              {count !== undefined && (
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums ${
                    isActive ? "bg-accent/15 text-accent" : "bg-surface-active text-text-secondary"
                  }`}
                >
                  {count.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {canScrollRight && (
        <>
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-[var(--color-bg)] to-transparent" />
          <button
            aria-label="Scroll options right"
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
