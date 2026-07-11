"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Users,
  Bookmark,
  Image as ImageIcon,
  Pencil,
  FileText,
  Tag as TagIcon,
  Eraser,
  Video,
  Camera,
  Users2,
  Car,
  Palette,
  Globe2,
  Search as SearchIconLucide,
  Building2,
  Music,
  Lightbulb,
  TrendingUp,
  LucideIcon,
} from "lucide-react";
import { SearchEntity } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";

/**
 * Deterministic pseudo-metrics derived from popularityScore + id, standing
 * in for the Subscribers/Saves/Tools/Models/Robots/Devices columns the real
 * API will eventually provide directly. Same entity always produces the
 * same numbers, so the table doesn't jitter between renders.
 */
function seededInt(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

interface TaskMetrics {
  subscribers: number;
  saves: number;
  tools: number;
  models: number;
  robots: number;
  devices: number;
}

function deriveTaskMetrics(entity: SearchEntity): TaskMetrics {
  const subscribers = entity.popularityScore * 130 + seededInt(`${entity.id}-sub`, 0, 9000);
  const saves = Math.round(entity.popularityScore * 9) + seededInt(`${entity.id}-sv`, 0, 900);
  const tools = Number(entity.meta.toolCount ?? 0) + seededInt(`${entity.id}-tl`, 0, 400);
  const modelsRoll = seededInt(`${entity.id}-mr`, 0, 10);
  const models = modelsRoll > 8 ? seededInt(`${entity.id}-md`, 5, 100) : 0;
  // Robots aren't wired up to any task yet on the real site either — kept at
  // zero across the board to match that.
  const robots = 0;
  const devicesRoll = seededInt(`${entity.id}-dr`, 0, 10);
  const devices = devicesRoll > 8 ? seededInt(`${entity.id}-dv`, 1, 5) : 0;
  return { subscribers, saves, tools, models, robots, devices };
}

/** Compact k/m formatting, used only for the Subscribers column. */
function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatCount(n: number): string {
  return n > 0 ? n.toLocaleString() : "-";
}

/** Cycles through a small set of icon/color pairs so each task row gets a
 *  distinct, deterministic glyph — standing in for per-task iconography the
 *  real API will eventually provide directly. */
const TASK_ICONS: { icon: LucideIcon; color: string }[] = [
  { icon: ImageIcon, color: "#EAB308" },
  { icon: Pencil, color: "#F97316" },
  { icon: FileText, color: "#9CA3AF" },
  { icon: TagIcon, color: "#FACC15" },
  { icon: Eraser, color: "#E5E7EB" },
  { icon: Video, color: "#38BDF8" },
  { icon: Camera, color: "#FB923C" },
  { icon: Users2, color: "#F472B6" },
  { icon: Car, color: "#60A5FA" },
  { icon: Palette, color: "#FB923C" },
  { icon: Globe2, color: "#38BDF8" },
  { icon: SearchIconLucide, color: "#A78BFA" },
  { icon: Building2, color: "#94A3B8" },
  { icon: Music, color: "#C084FC" },
  { icon: Lightbulb, color: "#FACC15" },
  { icon: TrendingUp, color: "#4ADE80" },
];

function TaskIcon({ entity }: { entity: SearchEntity }) {
  const { icon: Icon, color } = TASK_ICONS[seededInt(entity.id, 0, TASK_ICONS.length - 1)];
  return <Icon size={14} style={{ color }} className="shrink-0" />;
}

type SortKey = "subscribers" | "saves" | "tools" | "models" | "robots" | "devices";
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string; icon: LucideIcon }[] = [
  { key: "subscribers", label: "Subscribers", icon: Users },
  { key: "saves", label: "Saves", icon: Bookmark },
  { key: "tools", label: "Tools", icon: ENTITY_META.tool.icon },
  { key: "models", label: "Models", icon: ENTITY_META.model.icon },
  { key: "robots", label: "Robots", icon: ENTITY_META.robot.icon },
  { key: "devices", label: "Devices", icon: ENTITY_META.device.icon },
];

const SHOW_TABS = ["All Tasks", "For you", "Following"] as const;
type ShowTab = (typeof SHOW_TABS)[number];

interface TasksTableProps {
  items: SearchEntity[];
  total: number;
}

export function TasksTable({ items, total }: TasksTableProps) {
  const [showTab, setShowTab] = useState<ShowTab>("All Tasks");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "saves", dir: "desc" });

  const metricsById = useMemo(() => {
    const map = new Map<string, TaskMetrics>();
    items.forEach((entity) => map.set(entity.id, deriveTaskMetrics(entity)));
    return map;
  }, [items]);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const av = metricsById.get(a.id)![sort.key];
      const bv = metricsById.get(b.id)![sort.key];
      return sort.dir === "desc" ? bv - av : av - bv;
    });
  }, [items, metricsById, sort]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" }
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-text-primary text-bg">
          <CheckSquare size={14} strokeWidth={2.5} />
        </span>
        <h1 className="text-lg font-semibold text-text-primary">Tasks</h1>
      </div>
      <p className="mb-3 text-xs text-text-tertiary">{total.toLocaleString()} tasks</p>

      {/* Show: pills */}
      <div className="mb-4 flex items-center gap-2.5">
        <span className="text-xs text-text-tertiary">Show:</span>
        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          {SHOW_TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setShowTab(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                showTab === t ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              <th className="w-10 px-4 py-3">#</th>
              <th className="px-2 py-3">
                <span className="inline-flex items-center gap-1">
                  Task
                  <ChevronsUpDown size={11} className="text-text-tertiary/60" />
                </span>
              </th>
              {COLUMNS.map((col) => {
                const Icon = col.icon;
                const active = sort.key === col.key;
                return (
                  <th key={col.key} className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={`inline-flex items-center gap-1 transition-colors ${
                        active ? "text-text-primary" : "hover:text-text-secondary"
                      }`}
                    >
                      <Icon size={11} className="text-text-tertiary/70" />
                      {col.label}
                      {active ? (
                        sort.dir === "desc" ? (
                          <ChevronDown size={11} />
                        ) : (
                          <ChevronUp size={11} />
                        )
                      ) : (
                        <ChevronsUpDown size={11} className="text-text-tertiary/60" />
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((entity, index) => {
              const meta = ENTITY_META[entity.type];
              const href = `${meta.basePath}/${entity.slug}`;
              const m = metricsById.get(entity.id)!;

              return (
                <tr
                  key={entity.id}
                  className="group border-b border-border last:border-b-0 hover:bg-surface-hover"
                >
                  <td className="px-4 py-2.5 align-middle tabular-nums text-text-tertiary">
                    {index + 1}
                  </td>
                  <td className="px-2 py-2.5 align-middle">
                    <Link href={href} className="flex items-center gap-2">
                      <TaskIcon entity={entity} />
                      <span className="truncate text-sm font-medium text-accent-hover group-hover:text-accent">
                        {entity.title}
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 align-middle text-right tabular-nums text-text-secondary">
                    <span className="inline-flex items-center gap-1.5 justify-end">
                      <Users size={11} className="text-text-tertiary" />
                      {formatCompact(m.subscribers)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 align-middle text-right tabular-nums text-text-primary">
                    <span className="inline-flex items-center gap-1.5 justify-end">
                      <Bookmark size={11} className="text-text-tertiary" />
                      {formatCount(m.saves)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 align-middle text-right tabular-nums text-text-secondary">
                    {formatCount(m.tools)}
                  </td>
                  <td className="px-3 py-2.5 align-middle text-right tabular-nums text-text-secondary">
                    {formatCount(m.models)}
                  </td>
                  <td className="px-3 py-2.5 align-middle text-right tabular-nums text-text-secondary">
                    {formatCount(m.robots)}
                  </td>
                  <td className="px-3 py-2.5 align-middle text-right tabular-nums text-text-secondary">
                    {formatCount(m.devices)}
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