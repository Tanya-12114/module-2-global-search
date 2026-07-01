"use client";

interface FiltersProps {
  allCategories: string[];
  selected: string[];
  onChange: (categories: string[]) => void;
}

export function Filters({ allCategories, selected, onChange }: FiltersProps) {
  function toggle(category: string) {
    if (selected.includes(category)) {
      onChange(selected.filter((c) => c !== category));
    } else {
      onChange([...selected, category]);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-primary">Category</h3>
        {selected.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="text-xs text-text-tertiary hover:text-text-primary"
          >
            Reset
          </button>
        )}
      </div>
      <div className="space-y-1">
        {allCategories.map((category) => (
          <label
            key={category}
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
          >
            <input
              type="checkbox"
              checked={selected.includes(category)}
              onChange={() => toggle(category)}
              className="h-3.5 w-3.5 rounded border-border-hover accent-[var(--color-accent)]"
            />
            {category}
          </label>
        ))}
      </div>
    </div>
  );
}
