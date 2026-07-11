"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { SearchModal } from "@/components/search/SearchModal";
import { SearchModalProvider, useSearchModal } from "@/context/SearchModalContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "Trending", href: "/search/trending" },
  { label: "Leaderboard", href: "/search/rankings" },
  { label: "Collections", href: "/search/collections" },
  { label: "News", href: "/search/results?types=news" },
  { label: "Companies", href: "/search/results?types=company" },
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
      {/* Red banner — TAAFT's persistent "join for free" strip (static, no motion) */}
      <div className="bg-highlight py-1.5 text-center">
        <span className="px-6 text-xs font-semibold tracking-wide text-white sm:text-sm">
          Click here to join for free!
        </span>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur relative">
        {showBack && (
          <Link
            href="/"
            aria-label="Back to home"
            className="absolute left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-border-hover hover:bg-surface-hover hover:text-text-primary"
          >
            <ArrowLeft size={17} />
          </Link>
        )}

        <div className="relative mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
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
            className="ml-auto flex w-full max-w-xs items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-tertiary transition-colors hover:border-border-hover hover:text-text-secondary sm:max-w-sm"
          >
            <Search size={15} className="shrink-0" />
            <span className="flex-1 truncate text-left">Search</span>
            <kbd className="shrink-0 rounded border border-border bg-surface-hover px-1.5 py-0.5 text-[11px] text-text-tertiary">
              Ctrl+K
            </kbd>
          </button>

          <Link
            href="#"
            className="hidden shrink-0 rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover sm:block"
          >
            Sign up
          </Link>
        </div>
      </header>

      {children}

      <SearchModal open={isOpen} onClose={close} />
    </>
  );
}