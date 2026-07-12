"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { SearchHero } from "@/components/search/SearchHero";
import { HomeToolsSection } from "@/components/search/HomeToolsSection";
import { LoadingState } from "@/components/search/states/LoadingState";
import { MOCK_ENTITIES } from "@/lib/mockData";

const HOME_TOOLS = MOCK_ENTITIES.filter((e) => e.type === "tool" && e.imageUrl);

/**
 * The homepage: hero + entity-type-count pills (Tools/Companies/Models/…)
 * above the ranked tools table. This is a lighter hero than /search — it
 * shows counts, not the full 14-section browsing nav. That deeper "browse
 * every section" experience only appears at /search, reached by clicking
 * the Search icon in the sidebar.
 */
function HomeContent() {
  const router = useRouter();
  return (
    <main>
      <SearchHero
        q=""
        pills="entities"
        onSubmitQuery={(value) => router.push(`/search/results?q=${encodeURIComponent(value)}`)}
      />
      <HomeToolsSection tools={HOME_TOOLS} />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <LoadingState />
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
