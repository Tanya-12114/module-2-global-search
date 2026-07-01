import { SearchX } from "lucide-react";

export function EmptyState({
  query,
  onClearFilters,
  hasActiveFilters,
}: {
  query: string;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
      <SearchX size={28} className="text-text-tertiary" />
      <div>
        <p className="text-sm font-medium text-text-primary">
          {query ? `No results for "${query}"` : "No results"}
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          Try a different term, or check for typos.
        </p>
      </div>
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="mt-1 rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:border-border-hover hover:text-text-primary"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
