import { SearchEntity } from "@/types/entities";
import { ResultCard } from "./ResultCard";

export function ResultsGrid({ items }: { items: SearchEntity[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((entity) => (
        <ResultCard key={entity.id} entity={entity} />
      ))}
    </div>
  );
}
