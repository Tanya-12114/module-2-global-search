import { Suspense } from "react";
import { SearchPageContent } from "@/app/search/SearchPageContent";
import { LoadingState } from "@/components/search/states/LoadingState";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <LoadingState />
        </main>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}