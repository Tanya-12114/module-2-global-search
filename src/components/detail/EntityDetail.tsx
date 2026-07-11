import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EntityType } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";
import { getEntityBySlug } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

// -----------------------------------------------------------------------
// TEMPORARY. This generic page exists only so links out of Module 2's
// search results have somewhere real to land while Modules 3–10 build
// their actual detail pages (AI Tools, Companies, Models, News, Videos,
// Repositories, Collections). Delete each route once its real module
// module ships, or keep this file as a fallback/loading shell if you'd
// rather integrate gradually.
// -----------------------------------------------------------------------

export async function EntityDetail({ type, slug }: { type: EntityType; slug: string }) {
  const entity = await getEntityBySlug(type, slug);
  if (!entity) notFound();

  const meta = ENTITY_META[type];
  const Icon = meta.icon;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/search"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft size={15} />
        Back to search
      </Link>

      <div className="flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: meta.solidColor }}
        >
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
            {meta.label}
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold text-text-primary">{entity.title}</h1>
        </div>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-text-secondary">{entity.description}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {entity.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface p-5 sm:grid-cols-3">
        <Field label="Category" value={entity.category} />
        {Object.entries(entity.meta).map(([key, value]) => (
          <Field key={key} label={formatLabel(key)} value={String(value)} />
        ))}
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="mt-0.5 truncate text-sm text-text-primary">{value}</p>
    </div>
  );
}

function formatLabel(key: string): string {
  const spaced = key.replace(/([A-Z])/g, " $1");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}