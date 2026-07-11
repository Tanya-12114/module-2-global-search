"use client";

import Link from "next/link";
import {
  Search,
  Sparkles,
  Image as ImageIcon,
  Plus,
  Flame,
} from "lucide-react";
import { useSearchModal } from "@/context/SearchModalContext";
import { SectionPillsNav } from "@/components/search/SectionPillsNav";

interface SearchHeroProps {
  q: string;
  onSubmitQuery: (value: string) => void;
}

export function SearchHero({ q, onSubmitQuery }: SearchHeroProps) {
  const { open } = useSearchModal();

  return (
    <section className="hero-glow border-b border-border">
      <div className="mx-auto max-w-4xl px-4 pb-10 pt-12 text-center sm:px-6 lg:px-8">
        <h1 className="brand-wordmark mt-2 text-4xl text-text-primary sm:text-5xl">
          The&nbsp;AI&nbsp;Signal
        </h1>

        {/* Spotlight strip — one hand-picked featured tool, TAAFT's signature module */}
        <Link
          href="/tools/surething-io"
          className="mx-auto mt-5 flex max-w-xl items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm transition-colors hover:border-border-hover"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Sparkles size={12} />
          </span>
          <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-medium text-text-secondary">
            Spotlight
          </span>
          <span className="truncate text-text-primary">
            SureThing.io — &ldquo;OpenClaw&rdquo; for beginners
          </span>
          <span className="hidden shrink-0 rounded-full bg-bg px-2 py-0.5 text-[11px] text-text-secondary sm:inline">
            Task automation
          </span>
        </Link>

        {/* Search bar — dark pill input + separate circular submit button, TAAFT's exact shape */}
        <div className="mx-auto mt-6 flex max-w-xl items-center gap-3">
          <button
            type="button"
            onClick={open}
            className="flex flex-1 items-center gap-3 rounded-full border border-border bg-surface px-5 py-3.5 text-left transition-colors hover:border-border-hover"
          >
            <span className="flex-1 truncate text-sm text-text-tertiary">
              {q || "Search..."}
            </span>
            <kbd className="shrink-0 rounded border border-border bg-surface-hover px-1.5 py-0.5 text-[11px] text-text-tertiary">
              Ctrl + K
            </kbd>
          </button>
          <button
            type="button"
            onClick={open}
            aria-label="Search"
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover"
          >
            <Search size={20} />
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center justify-center gap-3 text-sm text-text-secondary sm:flex-row sm:gap-2.5">
          <p>The front page of AI. Used by 90M+ humans.</p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-active px-3 py-1 text-text-tertiary">
            <Flame size={13} className="text-accent" />
            79,552 searches today
          </span>
        </div>

        {/* Quick task shortcuts */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => onSubmitQuery("Generate images")}
            className="flex items-center gap-2 rounded-full bg-surface-active px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover"
          >
            <ImageIcon size={15} className="text-rose-400" />
            Generate images
          </button>
          <button
            onClick={() => onSubmitQuery("Create AI Tools")}
            className="flex items-center gap-2 rounded-full bg-surface-active px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover"
          >
            <Plus size={15} className="text-accent" />
            Create AI Tools
          </button>
        </div>

        {/* Section pills — each one is a real link to its own full results page */}
        <SectionPillsNav className="mx-auto mt-6 max-w-2xl justify-center" />
      </div>
    </section>
  );
}
