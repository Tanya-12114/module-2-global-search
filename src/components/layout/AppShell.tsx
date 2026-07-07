"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { SearchModal } from "@/components/search/SearchModal";
import { SearchModalProvider, useSearchModal } from "@/context/SearchModalContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "Deals", href: "/search?view=deals" },
  { label: "Leaderboard", href: "/search?view=leaderboard" },
  { label: "Tasks", href: "/search?types=task" },
  { label: "Mini tools", href: "/search?types=tool&size=mini" },
  { label: "Characters", href: "/search?types=character" },
  { label: "Map", href: "/search?view=map" },
  { label: "Prompts", href: "/search?types=prompt" },
];

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
      {/* Top utility bar — mirrors TAAFT's thin secondary row (auth + create-tool CTA) */}
      <div className="hidden border-b border-border bg-surface sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-4 py-1.5 text-xs text-text-secondary sm:px-6 lg:px-8">
          <Link href="#" className="hover:text-text-primary">
            Advertise
          </Link>
          <Link href="#" className="hover:text-text-primary">
            Newsletter
          </Link>
          <Link href="#" className="hover:text-text-primary">
            Merchandise
          </Link>
          <Link href="#" className="hover:text-text-primary">
            Contact us
          </Link>
          <Link href="#" className="hover:text-text-primary">
            Log in
          </Link>
          <Link
            href="#"
            className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-text hover:bg-accent-hover"
          >
            Sign up
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
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

          {/* Primary nav — TAAFT's Home / Search / Trending / Leaderboard / … row */}
          <nav className="hidden shrink-0 items-center gap-4 pl-2 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* TAAFT-style search trigger pill — opens the Ctrl+K overlay */}
          <button
            onClick={open}
            className="ml-auto flex w-full max-w-xs items-center gap-2 rounded-lg border border-border bg-input-bg px-3 py-1.5 text-sm text-text-tertiary transition-colors hover:border-border-hover hover:text-text-secondary sm:max-w-sm"
          >
            <Search size={15} className="shrink-0" />
            <span className="flex-1 truncate text-left">Search</span>
            <kbd className="shrink-0 rounded border border-border bg-surface-hover px-1.5 py-0.5 text-[11px] text-text-tertiary">
              Ctrl+K
            </kbd>
          </button>

          <Link
            href="#"
            className="hidden shrink-0 rounded-full bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-text transition-colors hover:bg-accent-hover sm:block"
          >
            Create tool
          </Link>
        </div>
      </header>

      {children}

      <SearchModal open={isOpen} onClose={close} />
    </>
  );
}