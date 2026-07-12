"use client";

import { useState } from "react";
import { SearchEntity } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";

/**
 * Renders a real brand logo when the entity has one (`imageUrl`, a Clearbit
 * logo URL keyed by the tool's domain). If that fails to load — a domain
 * with no logo on file, a network hiccup — it falls back to Google's
 * favicon service for the same domain, and only then to the generic
 * type-colored icon every entity type already has.
 */
export function EntityLogo({
  entity,
  size = 32,
}: {
  entity: SearchEntity;
  size?: number;
}) {
  const meta = ENTITY_META[entity.type];
  const Icon = meta.icon;
  const website = typeof entity.meta.website === "string" ? entity.meta.website : undefined;

  const [stage, setStage] = useState<"primary" | "fallback" | "icon">(
    entity.imageUrl ? "primary" : website ? "fallback" : "icon"
  );

  if (stage === "icon" || (!entity.imageUrl && !website)) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: meta.solidColor, width: size, height: size }}
        aria-hidden
      >
        <Icon size={Math.round(size * 0.47)} className="text-white" strokeWidth={2} />
      </div>
    );
  }

  const src =
    stage === "primary" && entity.imageUrl
      ? entity.imageUrl
      : `https://www.google.com/s2/favicons?sz=${Math.max(64, size * 2)}&domain=${website}`;

  return (
    // Plain <img>, not next/image: sources span dozens of third-party
    // brand-logo hosts, so a fixed remotePatterns allowlist can't cover
    // them all, and we need a runtime onError fallback chain anyway.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-md border border-border bg-white object-contain p-[3px]"
      style={{ width: size, height: size }}
      onError={() => setStage((s) => (s === "primary" ? "fallback" : "icon"))}
    />
  );
}
