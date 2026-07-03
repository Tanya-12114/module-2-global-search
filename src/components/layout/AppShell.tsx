"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { SearchModal } from "@/components/search/SearchModal";
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
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {showBack && (
            <Link
              href="/"
              aria-label="Back to home"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-border-hover hover:bg-surface-hover hover:text-text-primary"
            >
              <ArrowLeft size={17} />
            </Link>
          )}

          <Link href="/" className="shrink-0 text-sm font-semibold tracking-tight text-text-primary">
            The&nbsp;AI&nbsp;Signal
          </Link>

          {/* TAAFT-style search trigger pill — opens the ⌘K overlay */}
          <button
            onClick={open}
            className="ml-auto flex w-full max-w-xs items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-tertiary transition-colors hover:border-border-hover hover:text-text-secondary sm:max-w-sm"
          >
            <Search size={15} className="shrink-0" />
            <span className="flex-1 truncate text-left">Search</span>
            <kbd className="shrink-0 rounded border border-border bg-surface-hover px-1.5 py-0.5 text-[11px] text-text-tertiary">
              Ctrl+K
            </kbd>
          </button>
        </div>
      </header>

      {children}

      <SearchModal open={isOpen} onClose={close} />
    </>
  );
}