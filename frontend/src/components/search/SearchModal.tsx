"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { ALL_ENTITY_TYPES, ENTITY_META } from "@/lib/entityMeta";
import { EntityType } from "@/types/entities";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [activeType, setActiveType] = useState<EntityType | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset the field each time the modal transitions from closed to open.
  // This is the "adjusting state when a prop changes" pattern React docs
  // recommend in place of a setState-in-effect, so it's safe to do during
  // render rather than in a useEffect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValue("");
      setActiveType(null);
    }
  }

  const { suggestions, popular, isLoading } = useAutocomplete(value);
  const { recent, addRecent, clearRecent } = useRecentSearches();

  useEffect(() => {
    if (open) {
      // Focus after the panel opens (a real external-system side effect).
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  function submit(term: string, type?: EntityType | null) {
    const trimmed = term.trim();
    if (!trimmed && !type) return;
    if (trimmed) addRecent(trimmed);
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    if (type) params.set("types", type);
    onClose();
    router.push(`/search/results${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const filteredSuggestions = activeType
    ? suggestions.filter((s) => s.type === activeType)
    : suggestions;

  const showSuggestions = value.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-center px-4 pt-[10vh] sm:pt-[14vh]">
      {/* Backdrop */}
      <button
        aria-label="Close search"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative z-10 flex h-fit max-h-[76vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-bg shadow-2xl shadow-black/20">
        {/* Search field row */}
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
          <Search size={18} className="shrink-0 text-text-tertiary" />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit(value, activeType);
            }}
            placeholder="Search tools, companies, models, news..."
            className="w-full bg-transparent text-base text-text-primary placeholder:text-text-tertiary outline-none"
          />
          {value && (
            <button
              onClick={() => {
                setValue("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="shrink-0 rounded-full p-0.5 text-text-tertiary hover:text-text-primary"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-text-secondary hover:border-border-hover hover:text-text-primary"
          >
            Cancel
          </button>
        </div>

        {/* Quick entity-type filter chips — mirrors TAAFT's category pill row */}
        <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-2.5">
          <Chip active={activeType === null} onClick={() => setActiveType(null)}>
            All
          </Chip>
          {ALL_ENTITY_TYPES.map((type) => (
            <Chip
              key={type}
              active={activeType === type}
              onClick={() => setActiveType(activeType === type ? null : type)}
            >
              {ENTITY_META[type].plural}
            </Chip>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto">
          {showSuggestions ? (
            <SuggestionResults
              isLoading={isLoading}
              suggestions={filteredSuggestions}
              query={value}
              onSelectTerm={(term) => submit(term, activeType)}
            />
          ) : (
            <>
              {recent.length > 0 && (
                <Section
                  title="Recently viewed"
                  icon={<Clock size={13} />}
                  action={
                    <button
                      onClick={clearRecent}
                      className="text-xs text-text-tertiary hover:text-text-primary"
                    >
                      Clear
                    </button>
                  }
                >
                  {recent.map((term) => (
                    <TermRow key={term} term={term} onSelectTerm={(t) => submit(t, activeType)} />
                  ))}
                </Section>
              )}

              <Section title="Popular searches" icon={<TrendingUp size={13} />}>
                {popular.map((term) => (
                  <TermRow key={term} term={term} onSelectTerm={(t) => submit(t, activeType)} />
                ))}
              </Section>
            </>
          )}
        </div>

        {/* Footer hint row, like TAAFT's "⌘K to search" affordance */}
        <div className="flex items-center justify-between border-t border-border bg-surface-hover/40 px-4 py-2 text-xs text-text-tertiary">
          <span>
            <kbd className="rounded border border-border bg-surface px-1.5 py-0.5">↵</kbd>{" "}
            to search
          </span>
          <span>
            <kbd className="rounded border border-border bg-surface px-1.5 py-0.5">esc</kbd>{" "}
            to close
          </span>
        </div>
      </div>
    </div>
  );
}

function Chip({
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
      className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
        active
          ? "border-accent bg-accent-soft text-text-primary"
          : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function Section({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border p-2 last:border-b-0">
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
          {icon}
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function TermRow({
  term,
  onSelectTerm,
}: {
  term: string;
  onSelectTerm: (term: string) => void;
}) {
  return (
    <Link
      href={`/search/results?q=${encodeURIComponent(term)}`}
      onClick={() => onSelectTerm(term)}
      className="flex items-center rounded-md px-2.5 py-2 text-sm text-text-primary hover:bg-surface-hover"
    >
      {term}
    </Link>
  );
}

function SuggestionResults({
  isLoading,
  suggestions,
  query,
  onSelectTerm,
}: {
  isLoading: boolean;
  suggestions: { id: string; type: EntityType; title: string; category: string }[];
  query: string;
  onSelectTerm: (term: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-9 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-text-secondary">
        No matches for &ldquo;{query}&rdquo;.{" "}
        <button
          onClick={() => onSelectTerm(query)}
          className="text-accent hover:text-accent-hover"
        >
          Search anyway
        </button>
      </div>
    );
  }

  return (
    <div className="p-2">
      {suggestions.map((s) => {
        const Icon = ENTITY_META[s.type].icon;
        return (
          <Link
            key={s.id}
            href={`/search/results?q=${encodeURIComponent(s.title)}`}
            onClick={() => onSelectTerm(s.title)}
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-surface-hover"
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${ENTITY_META[s.type].tint}`}>
              <Icon size={14} />
            </span>
            <span className="flex-1 truncate text-text-primary">{s.title}</span>
            <span className="shrink-0 text-xs text-text-tertiary">
              {ENTITY_META[s.type].label} · {s.category}
            </span>
          </Link>
        );
      })}
      <button
        onClick={() => onSelectTerm(query)}
        className="mt-1 flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm text-accent hover:bg-surface-hover"
      >
        See all results for &ldquo;{query}&rdquo;
      </button>
    </div>
  );
}
