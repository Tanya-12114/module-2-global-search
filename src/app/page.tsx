import Link from "next/link";
import { Wrench, Building2, BrainCircuit, Newspaper, Layers } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";

const CATEGORY_SHORTCUTS = [
  { icon: Wrench, label: "AI Tools", type: "tool" },
  { icon: Building2, label: "Companies", type: "company" },
  { icon: BrainCircuit, label: "Models", type: "model" },
  { icon: Newspaper, label: "News", type: "news" },
  { icon: Layers, label: "Collections", type: "collection" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold tracking-tight text-text-primary">
            The&nbsp;AI&nbsp;Signal
          </Link>
        </div>
      </header>

      <section className="hero-glow">
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-secondary">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-highlight)" }}
            />
            The front page for everything AI
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            Find the right AI tool,
            <br className="hidden sm:block" /> before you build the wrong one.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-text-secondary">
            Search across tools, companies, models, news, and repositories —
            all in one place.
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar autoFocus />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/search"
              className="btn-neopop rounded-md px-4 py-2 text-sm font-medium"
            >
              Browse everything
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {CATEGORY_SHORTCUTS.map(({ icon: Icon, label, type }) => (
              <Link
                key={type}
                href={`/search?types=${type}`}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoCard
            title="Search everything at once"
            description="One query, results across every entity type on the platform — no switching tabs."
          />
          <InfoCard
            title="Filter down fast"
            description="Narrow by type, category, and sort by relevance, popularity, or recency."
          />
          <InfoCard
            title="Pick up where you left off"
            description="Recent and popular searches are one click away, every time you come back."
          />
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-sm font-medium text-text-primary">{title}</h3>
      <p className="mt-1.5 text-sm text-text-secondary">{description}</p>
    </div>
  );
}