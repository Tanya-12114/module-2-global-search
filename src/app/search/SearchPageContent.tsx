"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchHero } from "@/components/search/SearchHero";

/**
 * The /search landing page: hero, spotlight, search bar, and the 14 category
 * pills. It never shows a results list itself — submitting a query (or an
 * old bookmarked /search?q=... link) sends you to the dedicated
 * /search/results page, and every pill opens its own /search/[section] page.
 */
export function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  useEffect(() => {
    if (q) {
      router.replace(`/search/results?${searchParams.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <main>
      <SearchHero q="" onSubmitQuery={(value) => router.push(`/search/results?q=${encodeURIComponent(value)}`)} />
    </main>
  );
}
