"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS } from "@/lib/sections";

export function SectionPillsNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {SECTIONS.map(({ key, label, slug, icon: Icon }) => {
        const href = `/search/${slug}`;
        const isActive = pathname === href;
        return (
          <Link
            key={key}
            href={href}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-accent bg-accent text-white"
                : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
            }`}
          >
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
