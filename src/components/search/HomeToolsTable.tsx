"use client";

import Link from "next/link";
import { Eye, Bookmark, MessageSquare, Layers, Lock } from "lucide-react";
import { SearchEntity } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";
import { EntityLogo } from "@/components/ui/EntityLogo";

/** Deterministic pseudo-metrics, seeded from the entity id so numbers are
 * stable across renders instead of re-randomizing on every page load. */
function seededInt(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

function deriveMetrics(entity: SearchEntity) {
  const views = entity.popularityScore * 3 + seededInt(entity.id, 5, 900);
  const features = seededInt(`${entity.id}-f`, 1, 11);
  const saves = Math.round(entity.popularityScore / 40) + seededInt(`${entity.id}-s`, 0, 25);
  const reviews = seededInt(`${entity.id}-r`, 0, 12);
  const comments = seededInt(`${entity.id}-c`, 0, 8);
  return { views, features, saves, reviews, comments };
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatReleased(iso: string): string {
  const date = new Date(iso);
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Country name -> flag emoji, built from the ISO alpha-2 code via regional
 * indicator symbols (no image assets needed). */
const COUNTRY_CODES: Record<string, string> = {
  US: "US", UK: "GB", GB: "GB", FR: "FR", DE: "DE", CA: "CA", IL: "IL",
  CN: "CN", JP: "JP", IN: "IN", SG: "SG", NL: "NL", AU: "AU", KR: "KR",
  SE: "SE", PT: "PT", PL: "PL", ES: "ES", HK: "HK", LU: "LU",
};

function flagEmoji(code: string): string {
  const iso = COUNTRY_CODES[code] ?? code;
  if (iso.length !== 2) return "🌐";
  const base = 127397;
  return String.fromCodePoint(...[...iso.toUpperCase()].map((c) => c.charCodeAt(0) + base));
}

function priceLabel(entity: SearchEntity): { label: string; locked: boolean } {
  const pricing = String(entity.meta.pricing ?? "");
  if (pricing === "Free") return { label: "Free", locked: false };
  if (entity.priceAmount === undefined) return { label: pricing, locked: false };
  return { label: `$${entity.priceAmount.toFixed(2)}/mo`, locked: pricing === "Paid" };
}

interface HomeToolsTableProps {
  items: SearchEntity[];
}

export function HomeToolsTable({ items }: HomeToolsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-bg shadow-sm">
      <table className="w-full min-w-[1320px] table-fixed border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-left text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
            <th className="w-[28%] px-5 py-3.5">Name</th>
            <th className="w-[16%] px-4 py-3.5">Task</th>
            <th className="w-[10%] px-4 py-3.5 text-success">Released</th>
            <th className="w-[10%] px-4 py-3.5">Price</th>
            <th className="w-[8%] px-4 py-3.5">Country</th>
            <th className="w-[7%] px-4 py-3.5 text-right">Views</th>
            <th className="w-[7%] px-4 py-3.5 text-right">Features</th>
            <th className="w-[7%] px-4 py-3.5 text-right">Saves</th>
            <th className="w-[7%] px-4 py-3.5 text-right">Reviews</th>
            <th className="w-[6%] px-4 py-3.5 text-right">Comments</th>
          </tr>
        </thead>
        <tbody>
          {items.map((entity) => {
            const meta = ENTITY_META[entity.type];
            const href = `${meta.basePath}/${entity.slug}`;
            const { views, features, saves, reviews, comments } = deriveMetrics(entity);
            const price = priceLabel(entity);
            const task = typeof entity.meta.task === "string" ? entity.meta.task : entity.category;

            return (
              <tr
                key={entity.id}
                className="group border-b border-border last:border-b-0 hover:bg-surface-hover"
              >
                <td className="px-5 py-3.5 align-middle">
                  <Link href={href} className="flex items-center gap-3">
                    <EntityLogo entity={entity} size={32} />
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium text-text-primary group-hover:text-accent">
                        {entity.title}
                      </h3>
                      <p className="truncate text-xs text-text-tertiary">{entity.category}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3.5 align-middle">
                  <span className="inline-flex items-center gap-1.5 truncate rounded-full bg-surface-active px-2.5 py-1 text-xs text-text-secondary">
                    <Layers size={11} className="shrink-0 text-text-tertiary" />
                    <span className="truncate">{task}</span>
                  </span>
                </td>
                <td className="px-4 py-3.5 align-middle text-xs font-medium text-success">
                  {formatReleased(entity.createdAt)}
                </td>
                <td className="px-4 py-3.5 align-middle text-xs">
                  <span className="inline-flex items-center gap-1 text-text-secondary">
                    {price.label}
                    {price.locked && <Lock size={10} className="text-text-tertiary" />}
                  </span>
                </td>
                <td className="px-4 py-3.5 align-middle text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden>{flagEmoji(entity.country)}</span>
                    {entity.country}
                  </span>
                </td>
                <td className="px-4 py-3.5 align-middle text-right tabular-nums text-text-secondary">
                  <span className="inline-flex items-center justify-end gap-1">
                    <Eye size={12} className="text-text-tertiary" />
                    {formatCompact(views)}
                  </span>
                </td>
                <td className="px-4 py-3.5 align-middle text-right tabular-nums text-text-secondary">
                  {features}
                </td>
                <td className="px-4 py-3.5 align-middle text-right tabular-nums text-text-secondary">
                  <span className="inline-flex items-center justify-end gap-1">
                    <Bookmark size={12} className="text-text-tertiary" />
                    {formatCompact(saves)}
                  </span>
                </td>
                <td className="px-4 py-3.5 align-middle text-right tabular-nums text-text-secondary">
                  <span className="inline-flex items-center justify-end gap-1">
                    <MessageSquare size={12} className="text-text-tertiary" />
                    {reviews}
                  </span>
                </td>
                <td className="px-4 py-3.5 align-middle text-right tabular-nums text-text-tertiary">
                  {comments}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
