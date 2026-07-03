"use client";

import { EntityType } from "@/types/entities";
import { ALL_ENTITY_TYPES, ENTITY_META } from "@/lib/entityMeta";

interface EntityTabsProps {
  selected: EntityType[];
  onChange: (types: EntityType[]) => void;
  counts?: Partial<Record<EntityType, number>>;
}

export function EntityTabs({ selected, onChange, counts }: EntityTabsProps) {
  const isAll = selected.length === 0;

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
    <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      <TabButton active={isAll} onClick={() => onChange([])}>
        All
        {totalCount !== undefined && (
          <span className="ml-1.5 text-text-tertiary">{totalCount.toLocaleString()}</span>
        )}
      </TabButton>
      {ALL_ENTITY_TYPES.map((type) => (
        <TabButton key={type} active={selected.includes(type)} onClick={() => toggle(type)}>
          {ENTITY_META[type].plural}
          {counts?.[type] !== undefined && (
            <span className="ml-1.5 text-text-tertiary">{counts[type]!.toLocaleString()}</span>
          )}
        </TabButton>
      ))}
    </div>
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
