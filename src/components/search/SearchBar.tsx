"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { SearchDropdown } from "./SearchDropdown";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { useRecentSearches } from "@/hooks/useRecentSearches";

interface SearchBarProps {
  initialValue?: string;
  autoFocus?: boolean;
  onSubmit?: (term: string) => void;
}

export function SearchBar({ initialValue = "", autoFocus, onSubmit }: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { suggestions, popular, isLoading } = useAutocomplete(value);
  const { recent, addRecent, clearRecent } = useRecentSearches();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function submit(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    addRecent(trimmed);
    setIsOpen(false);
    if (onSubmit) {
      onSubmit(trimmed);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full text-left">
      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3.5 py-2.5 transition-colors focus-within:border-border-hover">
        <Search size={18} className="shrink-0 text-text-tertiary" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit(value);
            if (e.key === "Escape") setIsOpen(false);
          }}
          placeholder="Search tools, companies, models, news..."
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
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
        <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[11px] text-text-tertiary sm:block">
          &#8984;K
        </kbd>
      </div>

      {isOpen && (
        <SearchDropdown
          query={value}
          suggestions={suggestions}
          popular={popular}
          recent={recent}
          isLoading={isLoading}
          onSelectTerm={submit}
          onClearRecent={clearRecent}
        />
      )}
    </div>
  );
}