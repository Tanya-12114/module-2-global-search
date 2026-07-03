"use client";

interface FiltersProps {
  allCategories: string[];
  selected: string[];
  onChange: (categories: string[]) => void;
  allPricing?: string[];
  selectedPricing?: string[];
  onPricingChange?: (pricing: string[]) => void;
}

export function Filters({
  allCategories,
  selected,
  onChange,
  allPricing = [],
  selectedPricing = [],
  onPricingChange,
}: FiltersProps) {
  function toggle(category: string) {
    if (selected.includes(category)) {
      onChange(selected.filter((c) => c !== category));
    } else {
      onChange([...selected, category]);
    }
  }

  function togglePricing(option: string) {
    if (!onPricingChange) return;
    if (selectedPricing.includes(option)) {
      onPricingChange(selectedPricing.filter((p) => p !== option));
    } else {
      onPricingChange([...selectedPricing, option]);
    }
  }

  const hasAnyActive = selected.length > 0 || selectedPricing.length > 0;

  return (
    <div className="pr-2">
      {onPricingChange && allPricing.length > 0 && (
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-semibold tracking-tight text-text-primary">Pricing</h3>
            {hasAnyActive && (
              <button
                onClick={() => {
                  onChange([]);
                  onPricingChange?.([]);
                }}
                className="text-xs text-text-tertiary hover:text-text-primary"
              >
                Reset all
              </button>
            )}
          </div>
          <div className="space-y-0.5 pt-1">
            {allPricing.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
              >
                <input
                  type="checkbox"
                  checked={selectedPricing.includes(option)}
                  onChange={() => togglePricing(option)}
                  className="h-3.5 w-3.5 rounded border-border-hover accent-[var(--color-accent)]"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-semibold tracking-tight text-text-primary">Category</h3>
          {hasAnyActive && !(onPricingChange && allPricing.length > 0) && (
            <button
              onClick={() => {
                onChange([]);
                onPricingChange?.([]);
              }}
              className="text-xs text-text-tertiary hover:text-text-primary"
            >
              Reset all
            </button>
          )}
        </div>
        <div className="space-y-0.5 pt-1">
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
    </div>
  );
}