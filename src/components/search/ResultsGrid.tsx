import { SearchEntity } from "@/types/entities";
import { ResultCard } from "./ResultCard";

// Kept the filename/export name (`ResultsGrid`) so no other file needs to
// change imports — internally this now renders a dense list, not a grid,
// since a card grid doesn't scale to tens of thousands of results.
export function ResultsGrid({ items }: { items: SearchEntity[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {items.map((entity) => (
        <ResultCard key={entity.id} entity={entity} />
      ))}
    </div>
  );
}