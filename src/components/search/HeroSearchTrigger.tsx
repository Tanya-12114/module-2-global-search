"use client";

import { Search } from "lucide-react";
import { useSearchModal } from "@/context/SearchModalContext";

export function HeroSearchTrigger() {
  const { open } = useSearchModal();

  return (
    <button
      onClick={open}
      className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-3.5 text-left text-sm text-text-tertiary shadow-lg shadow-black/20 transition-colors hover:border-border-hover"
    >
      <Search size={18} className="shrink-0" />
      <span className="flex-1">Search tools, companies, models, news...</span>
      <kbd className="shrink-0 rounded border border-border bg-surface-hover px-1.5 py-0.5 text-[11px] text-text-tertiary">
        Ctrl+K
      </kbd>
    </button>
  );
}
