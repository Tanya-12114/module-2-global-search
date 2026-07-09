"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  List,
  LayoutGrid,
  ArrowUpDown,
  Bell,
} from "lucide-react";
import { SearchEntity } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";
import { REVIEWER_NAMES, TOOL_TITLES_FOR_STACKS } from "@/lib/mockData";

/** Deterministic pseudo-signals, same pattern used across the search
 *  module — stand-ins for fields the real API will eventually provide
 *  directly (author, tool stack, subscriber count). */
function seededInt(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function deriveCollectionSignals(entity: SearchEntity) {
  const author = REVIEWER_NAMES[seededInt(`${entity.id}-author`, 0, REVIEWER_NAMES.length - 1)];
  const toolCount = seededInt(`${entity.id}-toolcount`, 4, 32);
  const stackSize = Math.min(toolCount, seededInt(`${entity.id}-stacksize`, 5, 8));
  const stackHues = Array.from({ length: stackSize }, (_, i) =>
    seededInt(`${entity.id}-hue-${i}`, 0, 360)
  );
  const stackLetters = Array.from({ length: stackSize }, (_, i) => {
    const name = TOOL_TITLES_FOR_STACKS[seededInt(`${entity.id}-tool-${i}`, 0, TOOL_TITLES_FOR_STACKS.length - 1)];
    return name.charAt(0).toUpperCase();
  });
  const subscribers = seededInt(`${entity.id}-subs`, 1, 6);
  return { author, toolCount, stackHues, stackLetters, subscribers };
}

function AuthorAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  const hue = seededInt(name, 0, 360);
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: `hsl(${hue}, 55%, 45%)` }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

function ToolStack({ hues, letters, remaining }: { hues: number[]; letters: string[]; remaining: number }) {
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {hues.map((hue, i) => (
          <span
            key={i}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-surface text-[10px] font-semibold text-white"
            style={{ backgroundColor: `hsl(${hue}, 55%, 45%)` }}
            aria-hidden
          >
            {letters[i]}
          </span>
        ))}
      </div>
      {remaining > 0 && (
        <span className="ml-2 whitespace-nowrap text-xs text-text-tertiary">+{remaining} more</span>
      )}
    </div>
  );
}

type SortKey = "collection" | "subscribers" | "created";
type SortDir = "asc" | "desc";

function SortHeader({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-colors ${
        active ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary"
      } ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      {label}
      <ArrowUpDown size={11} className={active ? (dir === "asc" ? "rotate-180" : "") : "opacity-50"} />
    </button>
  );
}

interface CollectionsTableProps {
  items: SearchEntity[];
  total: number;
  filter: "new" | "popular";
  onFilterChange: (filter: "new" | "popular") => void;
}

export function CollectionsTable({ items, total, filter, onFilterChange }: CollectionsTableProps) {
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const meta = ENTITY_META.collection;

  const enriched = items.map((entity) => ({ entity, ...deriveCollectionSignals(entity) }));
  const totalTools = enriched.reduce((sum, e) => sum + e.toolCount, 0);
  const totalSubscribers = enriched.reduce((sum, e) => sum + e.subscribers, 0);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...enriched].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "collection") cmp = a.entity.title.localeCompare(b.entity.title);
    if (sortKey === "subscribers") cmp = a.subscribers - b.subscribers;
    if (sortKey === "created") cmp = new Date(a.entity.createdAt).getTime() - new Date(b.entity.createdAt).getTime();
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Layers size={18} />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Collections</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
              <span>
                Collections <span className="font-semibold text-text-primary">{formatCount(total)}</span>
              </span>
              <span>
                Total tools <span className="font-semibold text-text-primary">{formatCount(totalTools)}</span>
              </span>
              <span>
                Subscribers <span className="font-semibold text-text-primary">{formatCount(totalSubscribers)}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span>Show:</span>
            <div className="inline-flex rounded-full border border-border bg-surface p-1">
              {(["new", "popular"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => onFilterChange(f)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    filter === f
                      ? "bg-accent-soft text-accent"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <button className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover">
            <Plus size={13} />
            New
          </button>

          <div className="inline-flex rounded-md border border-border bg-surface p-1">
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
              className={`rounded px-1.5 py-1 transition-colors ${
                view === "list" ? "bg-surface-active text-text-primary" : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              className={`rounded px-1.5 py-1 transition-colors ${
                view === "grid" ? "bg-surface-active text-text-primary" : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-bg shadow-sm">
        <table className="w-full min-w-[860px] table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left">
              <th className="w-[4%] px-4 py-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                #
              </th>
              <th className="w-[26%] px-2 py-3">
                <SortHeader label="Collection" active={sortKey === "collection"} dir={sortDir} onClick={() => toggleSort("collection")} />
              </th>
              <th className="w-[16%] px-3 py-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Author
              </th>
              <th className="w-[28%] px-3 py-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Tools
              </th>
              <th className="w-[13%] px-3 py-3">
                <SortHeader label="Subscribers" active={sortKey === "subscribers"} dir={sortDir} onClick={() => toggleSort("subscribers")} />
              </th>
              <th className="w-[13%] px-3 py-3 text-right">
                <SortHeader label="Created" active={sortKey === "created"} dir={sortDir} onClick={() => toggleSort("created")} align="right" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ entity, author, toolCount, stackHues, stackLetters, subscribers }, index) => {
              const href = `${meta.basePath}/${entity.slug}`;
              const remaining = Math.max(0, toolCount - stackHues.length);

              return (
                <tr key={entity.id} className="group border-b border-border last:border-b-0 hover:bg-surface-hover">
                  <td className="px-4 py-3 align-middle tabular-nums text-text-tertiary">{index + 1}</td>
                  <td className="px-2 py-3 align-middle">
                    <Link href={href} className="flex items-center gap-2.5">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                        style={{ backgroundColor: meta.solidColor }}
                        aria-hidden
                      >
                        <Layers size={13} className="text-white" strokeWidth={2} />
                      </span>
                      <span className="truncate text-sm font-medium text-accent group-hover:text-accent-hover">
                        {entity.title}
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <span className="flex items-center gap-2 text-sm text-text-secondary">
                      <AuthorAvatar name={author} />
                      <span className="truncate">{author}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <ToolStack hues={stackHues} letters={stackLetters} remaining={remaining} />
                  </td>
                  <td className="px-3 py-3 align-middle text-text-secondary">
                    <span className="inline-flex items-center gap-1.5">
                      <Bell size={12} className="text-text-tertiary" />
                      {subscribers}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-middle text-right text-xs text-text-tertiary">
                    {formatDate(entity.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
