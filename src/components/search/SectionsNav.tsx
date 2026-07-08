"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { useSearchModal } from "@/context/SearchModalContext";
import { SECTIONS } from "@/lib/sections";

export function SectionsNav() {
  const pathname = usePathname();
  const { open } = useSearchModal();

  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto max-w-[90rem] px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/search"
            className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1.5 text-sm text-text-tertiary hover:text-text-primary"
          >
            <ArrowLeft size={14} />
            Search home
          </Link>

          <div className="mx-1 h-5 w-px shrink-0 bg-border" />

          {SECTIONS.map(({ key, label, slug, icon: Icon }) => {
            const href = `/search/${slug}`;
            const isActive = pathname === href;
            return (
              <Link
                key={key}
                href={href}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-accent bg-accent text-white"
                    : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
                }`}
              >
                <Icon size={13} />
                {label}
              </Link>
            );
          })}

          <button
            onClick={open}
            className="ml-auto flex shrink-0 items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm text-text-tertiary transition-colors hover:border-border-hover hover:text-text-secondary"
          >
            <Search size={14} />
            Search
            <kbd className="rounded border border-border bg-surface-hover px-1.5 py-0.5 text-[11px] text-text-tertiary">
              Ctrl+K
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
