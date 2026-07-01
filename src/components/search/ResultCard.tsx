import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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

/**
 * The logo slot. Prefers a real image (`entity.imageUrl`, once the backend
 * provides one). Until then, falls back to the entity type's own icon on a
 * solid, type-colored background — so the logo itself communicates "this is
 * a Repository" / "this is News" without needing a text label next to the
 * title.
 */
function EntityLogo({ entity }: { entity: SearchEntity }) {
  const meta = ENTITY_META[entity.type];
  const Icon = meta.icon;

  if (entity.imageUrl) {
    return (
      <Image
        src={entity.imageUrl}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-md object-cover"
      />
    );
  }

  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
      style={{ backgroundColor: meta.solidColor }}
      aria-hidden
    >
      <Icon size={17} className="text-white" strokeWidth={2} />
    </div>
  );
}

export function ResultCard({ entity }: { entity: SearchEntity }) {
  const meta = ENTITY_META[entity.type];
  const href = `${meta.basePath}/${entity.slug}`;

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 border-b border-border px-4 py-3.5 transition-colors last:border-b-0 hover:bg-surface-hover"
    >
      <EntityLogo entity={entity} />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-text-primary group-hover:text-white">
          {entity.title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-text-secondary">{entity.description}</p>
      </div>

      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        {entity.tags.slice(0, 2).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <div className="hidden w-36 shrink-0 text-right text-xs text-text-tertiary md:block">
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