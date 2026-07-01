import Link from "next/link";
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
    default:
      return "";
  }
}

export function ResultCard({ entity }: { entity: SearchEntity }) {
  const meta = ENTITY_META[entity.type];
  const Icon = meta.icon;
  const href = `${meta.basePath}/${entity.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-border-hover hover:bg-surface-hover hover:shadow-lg hover:shadow-black/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${meta.tint}`}>
            <Icon size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-text-primary group-hover:text-white">
              {entity.title}
            </h3>
            <p className="text-xs text-text-tertiary">{meta.label}</p>
          </div>
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-text-secondary">{entity.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {entity.tags.slice(0, 3).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-text-tertiary">
        <span>{metaSummary(entity)}</span>
        <span>{entity.category}</span>
      </div>
    </Link>
  );
}