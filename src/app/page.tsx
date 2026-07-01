import { SearchBar } from "@/components/search/SearchBar";

// This landing page exists only so Module 2 can be previewed standalone.
// Module 1 (Homepage) owns the real homepage — the <SearchBar /> component
// below is the piece that will be dropped into their layout.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-xs uppercase tracking-widest text-text-tertiary">
        Module 2 — Global Search preview
      </p>
      <h1 className="mb-8 text-2xl font-medium text-text-primary">
        Search tools, companies, models & more
      </h1>
      <div className="w-full">
        <SearchBar autoFocus />
      </div>
      <p className="mt-4 text-xs text-text-tertiary">
        Try &ldquo;code&rdquo;, &ldquo;image&rdquo;, or press Enter with an empty box to browse all
        results.
      </p>
    </main>
  );
}
