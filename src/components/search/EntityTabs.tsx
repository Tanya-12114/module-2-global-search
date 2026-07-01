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

  return (
    <div className="flex flex-wrap gap-2">
      <TabButton active={isAll} onClick={() => onChange([])}>
        All
      </TabButton>
      {ALL_ENTITY_TYPES.map((type) => (
        <TabButton key={type} active={selected.includes(type)} onClick={() => toggle(type)}>
          {ENTITY_META[type].plural}
          {counts?.[type] !== undefined && (
            <span className="ml-1.5 text-text-tertiary">{counts[type]}</span>
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
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? "border-accent bg-accent-soft text-text-primary"
          : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}
