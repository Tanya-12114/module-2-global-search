import Image from "next/image";
import Link from "next/link";
import { Eye, Bookmark, MessageSquare } from "lucide-react";
import { SearchEntity } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";
import { Badge } from "@/components/ui/Badge";

function metaSummary(entity: SearchEntity): string {
  switch (entity.type) {
    case "tool":
      return String(entity.meta.pricing ?? "");
    case "company":
      return String(entity.meta.headquarters ?? "");
    case "model":
      return `${entity.meta.contextWindow ?? ""} context`;
    case "news":
      return String(entity.meta.source ?? "");
    case "video":
      return `${entity.meta.duration ?? ""} · ${entity.meta.channel ?? ""}`;
    case "repository":
      return `★ ${entity.meta.stars ?? 0} · ${entity.meta.language ?? ""}`;
    case "collection":
      return String(entity.meta.curator ?? "");
    case "task":
      return `${entity.meta.toolCount ?? 0} tools`;
    case "country":
      return `${entity.meta.toolCount ?? 0} tools · ${entity.meta.companyCount ?? 0} companies`;
    case "fundraise":
      return `${entity.meta.amount ?? ""} · ${entity.meta.round ?? ""}`;
    case "investor":
      return `${entity.meta.portfolioSize ?? 0} investments · ${entity.meta.focus ?? ""}`;
    case "robot":
      return String(entity.meta.category ?? "");
    case "device":
      return String(entity.meta.pricing ?? "");
    default:
      return "";
  }
}

/**
 * Deterministic pseudo-metrics derived from popularityScore + id, standing
 * in for the Views/Saves/Reviews columns the real API will eventually
 * provide directly. Same entity always produces the same numbers.
 */
function seededInt(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

function deriveMetrics(entity: SearchEntity) {
  const views = entity.popularityScore * 8 + seededInt(entity.id, 0, 900);
  const saves = Math.round(entity.popularityScore / 12) + seededInt(`${entity.id}-s`, 0, 60);
  const reviews = seededInt(`${entity.id}-r`, 2, 260);
  return { views, saves, reviews };
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function EntityLogo({ entity }: { entity: SearchEntity }) {
  const meta = ENTITY_META[entity.type];
  const Icon = meta.icon;

  if (entity.imageUrl) {
    return (
      <Image
        src={entity.imageUrl}
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-md object-cover"
      />
    );
  }

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
      style={{ backgroundColor: meta.solidColor }}
      aria-hidden
    >
      <Icon size={15} className="text-white" strokeWidth={2} />
    </div>
  );
}

interface ResultsTableProps {
  items: SearchEntity[];
  /** Rank of the first row on this page, e.g. (page - 1) * pageSize + 1. */
  startRank: number;
}

export function ResultsTable({ items, startRank }: ResultsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-bg shadow-sm">
      <table className="w-full min-w-[900px] table-fixed border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-left text-xs font-medium uppercase tracking-wide text-text-tertiary">
            <th className="w-[4%] px-4 py-3">#</th>
            <th className="w-[38%] px-2 py-3">Name</th>
            <th className="w-[13%] px-3 py-3">Category</th>
            <th className="w-[17%] px-3 py-3">Price / meta</th>
            <th className="w-[9%] px-3 py-3 text-right">Views</th>
            <th className="w-[9%] px-3 py-3 text-right">Saves</th>
            <th className="w-[10%] px-3 py-3 text-right">Reviews</th>
          </tr>
        </thead>
        <tbody>
          {items.map((entity, index) => {
            const meta = ENTITY_META[entity.type];
            const href = `${meta.basePath}/${entity.slug}`;
            const { views, saves, reviews } = deriveMetrics(entity);

            return (
              <tr
                key={entity.id}
                className="group border-b border-border last:border-b-0 hover:bg-surface-hover"
              >
                <td className="px-4 py-3 align-top tabular-nums text-text-tertiary">
                  {startRank + index}
                </td>
                <td className="px-2 py-3 align-top">
                  <Link href={href} className="flex items-start gap-3">
                    <EntityLogo entity={entity} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-text-primary group-hover:text-accent">
                          {entity.title}
                        </h3>
                        <span className="shrink-0 text-[11px] uppercase tracking-wide text-text-tertiary/70">
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">
                        {entity.description}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {entity.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="px-3 py-3 align-top text-xs text-text-secondary">
                  {entity.category}
                </td>
                <td className="px-3 py-3 align-top text-xs text-text-secondary">
                  {metaSummary(entity)}
                </td>
                <td className="px-3 py-3 align-top text-right tabular-nums text-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <Eye size={12} className="text-text-tertiary" />
                    {formatCompact(views)}
                  </span>
                </td>
                <td className="px-3 py-3 align-top text-right tabular-nums text-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <Bookmark size={12} className="text-text-tertiary" />
                    {formatCompact(saves)}
                  </span>
                </td>
                <td className="px-3 py-3 align-top text-right tabular-nums text-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare size={12} className="text-text-tertiary" />
                    {reviews}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
