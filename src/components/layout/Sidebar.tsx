"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Home,
  Search,
  Tag,
  Trophy,
  CheckSquare,
  Scissors,
  Users,
  MapPin,
  Image as ImageIcon,
  Plus,
  Mail,
  ExternalLink,
  Shirt,
  HelpCircle,
  X,
} from "lucide-react";
/** Primary nav — the reference site's core sections. */
const TOP_ITEMS = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Tag, label: "Deals", href: "/search/results?types=collection" },
  { icon: Trophy, label: "Leaderboard", href: "/search/rankings" },
  { icon: CheckSquare, label: "Tasks", href: "/search/tasks" },
  { icon: Scissors, label: "Mini tools", href: "/search/mini-tools" },
  { icon: Users, label: "Characters", href: "/search/characters" },
  { icon: MapPin, label: "Map", href: "/search/near-me" },
  { icon: ImageIcon, label: "Prompts", href: "/search/results?types=collection" },
];

/** Secondary nav — launch/advertise & site-info links. */
const SECONDARY_ITEMS = [
  { icon: Plus, label: "Launch / Advertise", href: "#" },
  { icon: Mail, label: "Newsletter", href: "/search/newsletter", external: true },
  { icon: Shirt, label: "Merchandise", href: "#" },
  { icon: HelpCircle, label: "Contact us", href: "#" },
];

/**
 * Fixed left icon rail, the reference site's persistent secondary nav.
 * Collapsed to a narrow icon-only strip by default; the whole rail
 * expands into a wider labelled panel on hover (pure CSS via the
 * `group`/`group-hover` pattern below), overlaying page content without
 * reflowing it, then collapses back on pointer-leave.
 *
 * The Search icon links straight to the full /search page (hero, filter
 * pills, results) rather than opening the compact Ctrl+K quick-search
 * modal — that modal is a separate, header-only shortcut and isn't
 * wired up anywhere in this rail.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="group fixed left-0 top-[88px] bottom-0 z-30 hidden w-14 flex-col gap-1 overflow-y-auto overflow-x-hidden border-r border-border bg-bg py-4 transition-[width] duration-200 ease-out hover:w-60 hover:shadow-2xl lg:flex">
      {TOP_ITEMS.map((item) => (
        <SidebarButton
          key={item.label}
          icon={item.icon}
          label={item.label}
          href={item.href}
          active={pathname === item.href}
        />
      ))}

      <div className="mx-3 my-2 h-px shrink-0 bg-border" />

      {SECONDARY_ITEMS.map((item) => (
        <SidebarButton
          key={item.label}
          icon={item.icon}
          label={item.label}
          href={item.href}
          active={pathname === item.href}
          endIcon={item.external ? ExternalLink : undefined}
        />
      ))}

      <div className="mt-auto pt-2">
        <SidebarButton icon={Plus} label="Create tool" href="/search/requests" accent />
      </div>
    </aside>
  );
}

/**
 * Mobile counterpart to the desktop icon rail. Hidden at `lg` and up (where
 * the hover-expanding `Sidebar` takes over). Opened via a hamburger button in
 * the mobile header; renders as a full labeled panel — the permanently
 * "expanded" look of the desktop rail — sliding in from the left over a
 * dimmed backdrop.
 */
export function MobileNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sliding panel */}
      <aside
        className={`absolute left-0 top-0 flex h-full w-64 max-w-[80vw] flex-col gap-1 overflow-y-auto border-r border-border bg-bg py-4 shadow-2xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-2 flex items-center justify-between px-4">
          <span className="text-sm font-semibold tracking-tight text-text-primary">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <X size={16} />
          </button>
        </div>

        {TOP_ITEMS.map((item) => (
          <SidebarButton
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={pathname === item.href}
            expanded
            onNavigate={onClose}
          />
        ))}

        <div className="mx-3 my-2 h-px shrink-0 bg-border" />

        {SECONDARY_ITEMS.map((item) => (
          <SidebarButton
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={pathname === item.href}
            endIcon={item.external ? ExternalLink : undefined}
            expanded
            onNavigate={onClose}
          />
        ))}

        <div className="mt-auto pt-2">
          <SidebarButton icon={Plus} label="Create tool" href="/search/requests" accent expanded onNavigate={onClose} />
        </div>
      </aside>
    </div>
  );
}

function SidebarButton({
  icon: Icon,
  label,
  href,
  onClick,
  active,
  accent,
  endIcon: EndIcon,
  expanded,
  onNavigate,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  accent?: boolean;
  endIcon?: React.ElementType;
  /** Always show the label (used by the mobile drawer, which has no hover state). */
  expanded?: boolean;
  /** Called after navigating — lets the mobile drawer close itself on tap. */
  onNavigate?: () => void;
}) {
  const className = `mx-2 flex h-10 shrink-0 items-center overflow-hidden rounded-xl transition-all duration-150 ${
    accent
      ? "bg-accent text-white shadow-sm hover:bg-accent-hover hover:shadow-md"
      : active
        ? "bg-surface-active text-text-primary"
        : "text-text-tertiary hover:bg-surface-hover hover:text-text-primary"
  }`;

  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center">
        <Icon size={18} strokeWidth={2} />
      </span>
      <span
        className={
          expanded
            ? "flex flex-1 items-center justify-between gap-2 overflow-hidden pr-3"
            : "flex max-w-0 flex-1 items-center justify-between gap-2 overflow-hidden opacity-0 transition-[max-width,opacity] duration-200 ease-out group-hover:max-w-[160px] group-hover:pr-3 group-hover:opacity-100"
        }
      >
        <span className="truncate">{label}</span>
        {EndIcon && <EndIcon size={13} className="shrink-0 text-text-tertiary" />}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className} onClick={onNavigate}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} className={className}>
      {content}
    </button>
  );
}
