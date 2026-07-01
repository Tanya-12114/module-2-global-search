"use client";

import { SortOption } from "@/types/entities";

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Most relevant" },
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "az", label: "A–Z" },
];

export function SortSelect({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none hover:border-border-hover focus:border-border-hover"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
