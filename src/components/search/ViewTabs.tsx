"use client";

import { SearchView, SortOption, TimeRange } from "@/types/entities";

const VIEWS: { value: SearchView; label: string }[] = [
  { value: "forYou", label: "For You" },
  { value: "trending", label: "Trending" },
  { value: "leaderboard", label: "Leaderboard" },
];

const RANGES: { value: TimeRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

const FOR_YOU_SORTS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Most relevant" },
  { value: "newest", label: "Newest" },
  { value: "az", label: "A–Z" },
];

interface ViewTabsProps {
  view: SearchView;
  range: TimeRange;
  sort: SortOption;
  onViewChange: (view: SearchView) => void;
  onRangeChange: (range: TimeRange) => void;
  onSortChange: (sort: SortOption) => void;
}

export function ViewTabs({
  view,
  range,
  sort,
  onViewChange,
  onRangeChange,
  onSortChange,
}: ViewTabsProps) {
  const showRange = view === "trending" || view === "leaderboard";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-md border border-border bg-surface p-0.5">
        {VIEWS.map((v) => (
          <button
            key={v.value}
            onClick={() => onViewChange(v.value)}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              view === v.value
                ? "bg-accent-soft text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {showRange ? (
        <select
          value={range}
          onChange={(e) => onRangeChange(e.target.value as TimeRange)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none hover:border-border-hover focus:border-border-hover"
        >
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      ) : (
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none hover:border-border-hover focus:border-border-hover"
        >
          {FOR_YOU_SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
