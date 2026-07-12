"use client";

import { useMemo, useState } from "react";
import { SearchEntity } from "@/types/entities";
import { HomeToolsTable } from "@/components/search/HomeToolsTable";

type ToolsTab = "all" | "forYou" | "trending" | "leaderboard";

const TABS: { key: ToolsTab; label: string }[] = [
  { key: "all", label: "All tools" },
  { key: "forYou", label: "For You" },
  { key: "trending", label: "Trending" },
  { key: "leaderboard", label: "Leaderboard" },
];

const PAGE_SIZE = 20;

export function HomeToolsSection({ tools }: { tools: SearchEntity[] }) {
  const [tab, setTab] = useState<ToolsTab>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const sorted = useMemo(() => {
    const copy = [...tools];
    if (tab === "trending" || tab === "leaderboard") {
      copy.sort((a, b) => b.popularityScore - a.popularityScore);
    } else if (tab === "forYou") {
      copy.sort(() => 0.5 - Math.random());
    } else {
      copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return copy;
  }, [tools, tab]);

  const shown = sorted.slice(0, visible);

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-text-primary">
            {tools.length} AI tools, ranked and searchable
          </h2>
          <div className="flex flex-wrap gap-2">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setTab(key);
                  setVisible(PAGE_SIZE);
                }}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  tab === key
                    ? "border-accent bg-accent text-white"
                    : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <HomeToolsTable items={shown} />

        {visible < sorted.length && (
          <div className="mt-5 flex justify-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="rounded-full border border-border px-5 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
            >
              Show more tools
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
