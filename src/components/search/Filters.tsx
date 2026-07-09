"use client";

import { useState } from "react";

interface CheckboxGroupProps {
  title: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  counts?: Record<string, number>;
  /** Collapse to this many visible options with a "Show more" toggle. */
  collapseAfter?: number;
}

function CheckboxGroup({ title, options, selected, onChange, counts, collapseAfter }: CheckboxGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = collapseAfter && !expanded ? options.slice(0, collapseAfter) : options;

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div className="mb-5">
      <div className="mb-3 border-b border-border pb-3">
        <h3 className="text-sm font-semibold tracking-tight text-text-primary">{title}</h3>
      </div>
      <div className="space-y-0.5 pt-1">
        {visible.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center justify-between gap-2.5 rounded-md px-1.5 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
          >
            <span className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
                className="h-3.5 w-3.5 rounded border-border-hover accent-[var(--color-accent)]"
              />
              {option}
            </span>
            {counts && (
              <span className="tabular-nums text-xs text-text-tertiary">
                {(counts[option] ?? 0).toLocaleString()}
              </span>
            )}
          </label>
        ))}
      </div>
      {collapseAfter && options.length > collapseAfter && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 px-1.5 text-xs font-medium text-accent hover:underline"
        >
          {expanded ? "Show less" : `Show ${options.length - collapseAfter} more`}
        </button>
      )}
    </div>
  );
}

interface PriceRangeProps {
  bounds: { min: number; max: number };
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

function PriceRangeFilter({ bounds, value, onChange }: PriceRangeProps) {
  const [min, max] = value;

  function setMin(next: number) {
    onChange([Math.min(next, max), max]);
  }
  function setMax(next: number) {
    onChange([min, Math.max(next, min)]);
  }

  return (
    <div className="mb-5">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-semibold tracking-tight text-text-primary">Price / month</h3>
        <span className="text-xs tabular-nums text-text-tertiary">
          ${min} – ${max === bounds.max ? `${max}+` : max}
        </span>
      </div>
      <div className="px-1.5 pt-2">
        <div className="relative h-1.5 rounded-full bg-surface-active">
          <div
            className="absolute h-1.5 rounded-full bg-accent"
            style={{
              left: `${bounds.max ? (min / bounds.max) * 100 : 0}%`,
              right: `${bounds.max ? 100 - (max / bounds.max) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="relative h-0">
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            className="range-thumb pointer-events-none absolute inset-x-0 -top-3 h-4 w-full appearance-none bg-transparent"
            aria-label="Minimum price"
          />
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            className="range-thumb pointer-events-none absolute inset-x-0 -top-3 h-4 w-full appearance-none bg-transparent"
            aria-label="Maximum price"
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-text-tertiary">
          <span>Free</span>
          <span>${bounds.max}+</span>
        </div>
      </div>
    </div>
  );
}

interface FiltersProps {
  allCategories: string[];
  selected: string[];
  onChange: (categories: string[]) => void;
  categoryCounts?: Record<string, number>;

  allPricing?: string[];
  selectedPricing?: string[];
  onPricingChange?: (pricing: string[]) => void;
  pricingCounts?: Record<string, number>;

  allFeatures?: string[];
  selectedFeatures?: string[];
  onFeaturesChange?: (features: string[]) => void;
  featureCounts?: Record<string, number>;

  allCountries?: string[];
  selectedCountries?: string[];
  onCountriesChange?: (countries: string[]) => void;
  countryCounts?: Record<string, number>;

  priceBounds?: { min: number; max: number };
  priceRange?: [number, number];
  onPriceRangeChange?: (range: [number, number]) => void;
}

export function Filters({
  allCategories,
  selected,
  onChange,
  categoryCounts,
  allPricing = [],
  selectedPricing = [],
  onPricingChange,
  pricingCounts,
  allFeatures = [],
  selectedFeatures = [],
  onFeaturesChange,
  featureCounts,
  allCountries = [],
  selectedCountries = [],
  onCountriesChange,
  countryCounts,
  priceBounds,
  priceRange,
  onPriceRangeChange,
}: FiltersProps) {
  const hasAnyActive =
    selected.length > 0 ||
    selectedPricing.length > 0 ||
    selectedFeatures.length > 0 ||
    selectedCountries.length > 0 ||
    (priceBounds && priceRange && (priceRange[0] > priceBounds.min || priceRange[1] < priceBounds.max));

  function resetAll() {
    onChange([]);
    onPricingChange?.([]);
    onFeaturesChange?.([]);
    onCountriesChange?.([]);
    if (priceBounds && onPriceRangeChange) onPriceRangeChange([priceBounds.min, priceBounds.max]);
  }

  return (
    <div className="pr-2">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Filters</span>
        {hasAnyActive && (
          <button onClick={resetAll} className="text-xs text-text-tertiary hover:text-text-primary">
            Reset all
          </button>
        )}
      </div>

      {priceBounds && priceRange && onPriceRangeChange && (
        <PriceRangeFilter bounds={priceBounds} value={priceRange} onChange={onPriceRangeChange} />
      )}

      {onPricingChange && allPricing.length > 0 && (
        <CheckboxGroup
          title="Pricing"
          options={allPricing}
          selected={selectedPricing}
          onChange={onPricingChange}
          counts={pricingCounts}
        />
      )}

      <CheckboxGroup
        title="Category"
        options={allCategories}
        selected={selected}
        onChange={onChange}
        counts={categoryCounts}
      />

      {onFeaturesChange && allFeatures.length > 0 && (
        <CheckboxGroup
          title="Features"
          options={allFeatures}
          selected={selectedFeatures}
          onChange={onFeaturesChange}
          counts={featureCounts}
          collapseAfter={6}
        />
      )}

      {onCountriesChange && allCountries.length > 0 && (
        <CheckboxGroup
          title="Country"
          options={allCountries}
          selected={selectedCountries}
          onChange={onCountriesChange}
          counts={countryCounts}
          collapseAfter={5}
        />
      )}
    </div>
  );
}
