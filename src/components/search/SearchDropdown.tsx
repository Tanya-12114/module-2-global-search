"use client";

import { Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AutocompleteSuggestion } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";

interface SearchDropdownProps {
  query: string;
  suggestions: AutocompleteSuggestion[];
  popular: string[];
  recent: string[];
  isLoading: boolean;
  onSelectTerm: (term: string) => void;
  onClearRecent: () => void;
}

export function SearchDropdown({
  query,
  suggestions,
  popular,
  recent,
  isLoading,
  onSelectTerm,
  onClearRecent,
}: SearchDropdownProps) {
  const showSuggestions = query.trim().length > 0;

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-[420px] overflow-y-auto rounded-lg border border-border bg-bg text-left shadow-2xl shadow-black/10">
      {showSuggestions ? (
        <SuggestionList
          isLoading={isLoading}
          suggestions={suggestions}
          query={query}
          onSelectTerm={onSelectTerm}
        />
      ) : (
        <>
          {recent.length > 0 && (
            <Section
              title="Recent searches"
              icon={<Clock size={13} />}
              action={
                <button
                  onClick={onClearRecent}
                  className="text-xs text-text-tertiary hover:text-text-primary"
                >
                  Clear
                </button>
              }
            >
              {recent.map((term) => (
                <TermRow key={term} term={term} onSelectTerm={onSelectTerm} />
              ))}
            </Section>
          )}

          <Section title="Popular searches" icon={<TrendingUp size={13} />}>
            {popular.map((term) => (
              <TermRow key={term} term={term} onSelectTerm={onSelectTerm} />
            ))}
          </Section>
        </>
      )}
    </div>
  );
}

function SuggestionList({
  isLoading,
  suggestions,
  query,
  onSelectTerm,
}: {
  isLoading: boolean;
  suggestions: AutocompleteSuggestion[];
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
      <div className="p-4 text-center text-sm text-text-secondary">
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
    <div className="p-1.5">
      {suggestions.map((s) => {
        const Icon = ENTITY_META[s.type].icon;
        return (
          <Link
            key={s.id}
            href={`/search?q=${encodeURIComponent(s.title)}`}
            onClick={() => onSelectTerm(s.title)}
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-surface-hover"
          >
            <Icon size={16} className="shrink-0 text-text-tertiary" />
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
    <div className="border-b border-border p-1.5 last:border-b-0">
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
      href={`/search?q=${encodeURIComponent(term)}`}
      onClick={() => onSelectTerm(term)}
      className="flex items-center rounded-md px-2.5 py-2 text-sm text-text-primary hover:bg-surface-hover"
    >
      {term}
    </Link>
  );
}