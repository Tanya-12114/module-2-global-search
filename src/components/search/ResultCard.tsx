import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SearchEntity } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";
import { Badge } from "@/components/ui/Badge";
import { EntityLogo } from "@/components/ui/EntityLogo";

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

export function ResultCard({ entity }: { entity: SearchEntity }) {
  const meta = ENTITY_META[entity.type];
  const href = `${meta.basePath}/${entity.slug}`;

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 border-b border-border px-4 py-3.5 transition-colors last:border-b-0 hover:bg-surface-hover"
    >
      <EntityLogo entity={entity} size={36} />

      <div className="min-w-[180px] flex-1">
        <h3 className="truncate text-sm font-medium text-text-primary group-hover:text-accent">
          {entity.title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-text-secondary">{entity.description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {entity.tags.slice(0, 2).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <div className="w-36 shrink-0 text-right text-xs text-text-tertiary">
        <p className="truncate">{metaSummary(entity)}</p>
        <p className="truncate text-text-tertiary/70">{entity.category}</p>
      </div>

      <ChevronRight
        size={16}
        className="shrink-0 text-text-tertiary/0 transition-colors group-hover:text-text-tertiary"
      />
    </Link>
  );
}