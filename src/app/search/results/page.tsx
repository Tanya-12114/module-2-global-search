import { Suspense } from "react";
import { LoadingState } from "@/components/search/states/LoadingState";
import { ResultsPageContent } from "./ResultsPageContent";

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <LoadingState />
        </main>
      }
    >
      <ResultsPageContent />
    </Suspense>
  );
}
