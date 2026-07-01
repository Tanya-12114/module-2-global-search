import { EntityType, SearchEntity } from "@/types/entities";

// ---------------------------------------------------------------------------
// This file is a STAND-IN for the real backend. Every entity here has the
// exact shape the real API is expected to return (see types/entities.ts).
// Once the main repo + API are ready, only src/lib/api.ts needs to change —
// no component in this module reads from this file directly.
// ---------------------------------------------------------------------------

const TOOL_NAMES = [
  "PixelForge", "CopyCraft AI", "Insightly", "VoiceCanvas", "SnapSummarize",
  "DevMate", "ClipGenius", "LeadPilot", "ScribeFlow", "ChartWise",
  "TransLingo", "PromptStudio", "AutoBrief", "PitchPerfect", "CodeSherpa",
  "MetricMind", "EchoNote", "FrameSense", "TaskWeaver", "QueryLens",
];
const COMPANY_NAMES = [
  "Northwind AI", "Basalt Labs", "Meridian Systems", "Cobalt Intelligence",
  "Fernweh AI", "Arclight Technologies", "Solace Labs", "Driftwood AI",
  "Ironclad Systems", "Halcyon AI",
];
const MODEL_NAMES = [
  "Cortex-3", "Lumen VL", "Sable 7B", "Aster Turbo", "Nimbus Mini",
  "Quartz Reasoning", "Ferro Code", "Willow Chat", "Ember Vision", "Basalt-1",
];
const NEWS_TITLES = [
  "Funding round closes for enterprise search startup",
  "New benchmark shakes up small-model rankings",
  "Open-source model matches closed frontier performance",
  "Regulator publishes draft guidance on model transparency",
  "Developer tools startup ships agentic code review",
  "Report: adoption of AI coding assistants doubles YoY",
  "Model provider cuts inference pricing by 40%",
  "New multimodal benchmark released for video understanding",
];
const VIDEO_TITLES = [
  "Building a RAG pipeline from scratch",
  "Inside the model: how attention actually works",
  "Shipping an AI feature in a weekend",
  "Comparing three open-source coding agents",
  "Prompt engineering patterns that actually hold up",
  "A tour of the fastest inference stacks in 2026",
];
const REPO_NAMES = [
  "vector-lite", "agent-kit", "promptc", "rag-bench", "tokenwise",
  "eval-harness", "chat-ui-kit", "infer-proxy", "graph-rag", "spec-agent",
];
const COLLECTION_NAMES = [
  "Best AI Tools for Developers", "Best AI Agents 2026", "Best AI for Marketing Teams",
  "Best Free AI Tools", "Best AI Coding Assistants", "Best AI for Solo Founders",
];

const CATEGORIES = [
  "Writing", "Coding", "Image Generation", "Video", "Audio", "Productivity",
  "Marketing", "Research", "Data Analysis", "Customer Support",
];

const TAG_POOL = [
  "API", "Open Source", "Free Tier", "Agents", "No Signup", "Automation",
  "Enterprise", "Self-Hosted", "MCP", "Realtime", "Multimodal", "Fine-tunable",
];

function seededRandom(seed: number) {
  let t = seed;
  return () => {
    t = (t * 1103515245 + 12345) % 2147483648;
    return t / 2147483648;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickMany<T>(arr: T[], count: number, rand: () => number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, count);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function buildEntities(): SearchEntity[] {
  const rand = seededRandom(42);
  const entities: SearchEntity[] = [];
  let idCounter = 1;

  const push = (
    type: EntityType,
    title: string,
    description: string,
    meta: Record<string, string | number>
  ) => {
    entities.push({
      id: `${type}-${idCounter++}`,
      type,
      title,
      description,
      category: pick(CATEGORIES, rand),
      tags: pickMany(TAG_POOL, 2 + Math.floor(rand() * 3), rand),
      meta,
      popularityScore: Math.floor(rand() * 10000),
      createdAt: daysAgo(Math.floor(rand() * 400)),
    });
  };

  TOOL_NAMES.forEach((name) =>
    push("tool", name, `${name} helps teams automate repetitive work using AI, with a focus on speed and simplicity.`, {
      pricing: pick(["Free", "Freemium", "Paid", "Free Trial"], rand),
      website: `${name.toLowerCase().replace(/\s+/g, "")}.ai`,
    })
  );

  COMPANY_NAMES.forEach((name) =>
    push("company", name, `${name} builds AI-native products for modern teams, backed by a growing engineering org.`, {
      headquarters: pick(["San Francisco, US", "London, UK", "Bengaluru, IN", "Berlin, DE"], rand),
      founded: 2018 + Math.floor(rand() * 7),
    })
  );

  MODEL_NAMES.forEach((name) =>
    push("model", name, `${name} is a general-purpose model tuned for reasoning and tool use, with strong latency characteristics.`, {
      contextWindow: pick(["32K", "128K", "200K", "1M"], rand),
      openSource: pick(["Yes", "No"], rand),
    })
  );

  NEWS_TITLES.forEach((title) =>
    push("news", title, `${title}. Industry watchers say the move signals a broader shift in how teams evaluate AI vendors.`, {
      source: pick(["The AI Signal", "Model Weekly", "Inference Daily"], rand),
    })
  );

  VIDEO_TITLES.forEach((title) =>
    push("video", title, `A practical walkthrough covering ${title.toLowerCase()}, with real examples and code.`, {
      duration: `${5 + Math.floor(rand() * 25)}:00`,
      channel: pick(["Build With AI", "The Model Lab", "Shipfast"], rand),
    })
  );

  REPO_NAMES.forEach((name) =>
    push("repository", name, `${name} is a lightweight, well-tested library used in production AI pipelines.`, {
      stars: Math.floor(rand() * 12000),
      language: pick(["TypeScript", "Python", "Rust", "Go"], rand),
      license: pick(["MIT", "Apache-2.0", "GPL-3.0"], rand),
    })
  );

  COLLECTION_NAMES.forEach((name) =>
    push("collection", name, `A curated list of the tools worth trying this quarter, updated monthly.`, {
      curator: "Editorial Team",
    })
  );

  return entities;
}

export const MOCK_ENTITIES: SearchEntity[] = buildEntities();

export const POPULAR_SEARCH_TERMS = [
  "AI coding assistant",
  "image generation",
  "voice cloning",
  "RAG",
  "open source model",
  "agents",
];
