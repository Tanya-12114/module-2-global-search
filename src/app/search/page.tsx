import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SearchPageContent } from "./SearchPageContent";
import { LoadingState } from "@/components/search/states/LoadingState";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <>
          <header className="border-b border-border">
            <div className="mx-auto flex max-w-6xl items-center px-4 py-3 sm:px-6 lg:px-8">
              <Link
                href="/"
                aria-label="Back to home"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-border-hover hover:bg-surface-hover hover:text-text-primary"
              >
                <ArrowLeft size={17} />
              </Link>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <LoadingState />
          </main>
        </>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}