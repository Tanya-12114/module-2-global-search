"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Search, CheckSquare, Tag, Percent, ChevronDown, Sparkles } from "lucide-react";
import { SearchModal } from "@/components/search/SearchModal";
import { Sidebar } from "@/components/layout/Sidebar";
import { SearchModalProvider, useSearchModal } from "@/context/SearchModalContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SearchModalProvider>
      <AppShellInner>{children}</AppShellInner>
    </SearchModalProvider>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { isOpen, open, close } = useSearchModal();
  const pathname = usePathname();
  const showBack = pathname !== "/";

  return (
    <>
      {/* Red banner — TAAFT's persistent "join for free" strip (static, no motion) */}
      <div className="bg-highlight py-1.5 text-center">
        <span className="px-6 text-xs font-semibold tracking-wide text-white sm:text-sm">
          Click here to join for free!
        </span>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-bg relative">
        {showBack && (
          <Link
            href="/"
            aria-label="Back to home"
            className="absolute left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-border-hover hover:bg-surface-hover hover:text-text-primary lg:hidden"
          >
            <ArrowLeft size={17} />
          </Link>
        )}

        <div className="relative mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-text-primary">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
              <Sparkles size={14} />
            </span>
            <span className="hidden sm:inline">The&nbsp;AI&nbsp;Signal</span>
          </Link>

          {/* Free mode toggle — cosmetic, matches the reference site's mode switch */}
          <div className="hidden shrink-0 items-center gap-2 text-sm text-text-secondary lg:flex">
            <span>Free mode</span>
            <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-surface-active">
              <span className="h-3.5 w-3.5 translate-x-1 rounded-full bg-text-tertiary transition-transform" />
            </span>
          </div>

          {/* Tasks / Prompts / Deals — quick-jump pills to the most-used sections */}
          <nav className="hidden shrink-0 items-center gap-2 lg:flex">
            <Link
              href="/search/tasks"
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
            >
              <CheckSquare size={14} />
              Tasks
              <ChevronDown size={13} />
            </Link>
            <Link
              href="/search/results?types=collection"
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
            >
              <Tag size={14} />
              Prompts
            </Link>
            <Link
              href="/search/results?types=collection"
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
            >
              <Percent size={14} />
              Deals
            </Link>
          </nav>

          {/* Search trigger pill — opens the shared Ctrl+K global search modal */}
          <button
            onClick={open}
            className="ml-auto flex w-full max-w-[220px] items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text-tertiary transition-colors hover:border-border-hover hover:text-text-secondary sm:max-w-xs"
          >
            <Search size={15} className="shrink-0" />
            <span className="flex-1 truncate text-left">Search</span>
            <kbd className="hidden shrink-0 rounded border border-border bg-surface-hover px-1.5 py-0.5 text-[11px] text-text-tertiary sm:inline">
              Ctrl+K
            </kbd>
          </button>

          <Link
            href="#"
            className="hidden shrink-0 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:block"
          >
            Log in
          </Link>

          <Link
            href="#"
            className="hidden shrink-0 rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover sm:block"
          >
            Sign up
          </Link>
        </div>
      </header>

      <Sidebar />

      <div className="lg:pl-14">{children}</div>

      <SearchModal open={isOpen} onClose={close} />
    </>
  );
}