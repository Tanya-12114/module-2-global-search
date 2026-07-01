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
  { label: string; plural: string; icon: LucideIcon }
> = {
  tool: { label: "Tool", plural: "Tools", icon: Wrench },
  company: { label: "Company", plural: "Companies", icon: Building2 },
  model: { label: "Model", plural: "Models", icon: BrainCircuit },
  news: { label: "News", plural: "News", icon: Newspaper },
  video: { label: "Video", plural: "Videos", icon: Video },
  repository: { label: "Repository", plural: "Repositories", icon: GitBranch },
  collection: { label: "Collection", plural: "Collections", icon: Layers },
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
