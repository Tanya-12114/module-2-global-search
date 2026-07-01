import {
  Wrench,
  Building2,
  BrainCircuit,
  Newspaper,
  Video,
  GitBranch,
  Layers,
  LucideIcon,
} from "lucide-react";
import { EntityType } from "@/types/entities";

export const ENTITY_META: Record<
  EntityType,
  {
    label: string;
    plural: string;
    icon: LucideIcon;
    basePath: string;
    /** low-opacity tint + matching text color for the icon chip on cards */
    tint: string;
    /** solid hex used as the logo-avatar background for this entity type */
    solidColor: string;
  }
> = {
  tool: {
    label: "Tool",
    plural: "Tools",
    icon: Wrench,
    basePath: "/tools",
    tint: "bg-accent-soft text-accent-hover",
    solidColor: "#5E6AD2",
  },
  company: {
    label: "Company",
    plural: "Companies",
    icon: Building2,
    basePath: "/companies",
    tint: "bg-sky-500/10 text-sky-300",
    solidColor: "#0EA5E9",
  },
  model: {
    label: "Model",
    plural: "Models",
    icon: BrainCircuit,
    basePath: "/models",
    tint: "bg-violet-500/10 text-violet-300",
    solidColor: "#8B5CF6",
  },
  news: {
    label: "News",
    plural: "News",
    icon: Newspaper,
    basePath: "/news",
    tint: "bg-amber-500/10 text-amber-300",
    solidColor: "#D97706",
  },
  video: {
    label: "Video",
    plural: "Videos",
    icon: Video,
    basePath: "/videos",
    tint: "bg-pink-500/10 text-pink-300",
    solidColor: "#DB2777",
  },
  repository: {
    label: "Repository",
    plural: "Repositories",
    icon: GitBranch,
    basePath: "/repositories",
    tint: "bg-emerald-500/10 text-emerald-300",
    solidColor: "#059669",
  },
  collection: {
    label: "Collection",
    plural: "Collections",
    icon: Layers,
    basePath: "/collections",
    tint: "bg-lime-500/10 text-lime-300",
    solidColor: "#65A30D",
  },
};

export const ALL_ENTITY_TYPES: EntityType[] = [
  "tool",
  "company",
  "model",
  "news",
  "video",
  "repository",
  "collection",
];