import { EntityType, SearchEntity } from "@/types/entities";
import { REAL_TOOLS } from "@/lib/realTools";

/** Real-brand logo for a tool's domain. Clearbit's free Logo API was
 * permanently shut down on Dec 1, 2025, so this uses Google's public
 * favicon service instead — no API key or signup required. `sz=128`
 * asks for the largest size Google will serve (actual favicon quality
 * varies by site, but it's the best free, keyless option available). */
export function logoForDomain(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

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
  "Kids Story Book Generators", "Wooden Art & Design Tools", "Branding Toolkit",
  "AI Agents & Assistants", "Summarize Anything", "Lifestyle AI Picks",
  "Ultimate AI Toolkit for YouTube Creators", "SEO Tools Worth Trying", "Personal Assistant & Help",
  "Tarot & Fortune Telling AI", "Literally The Coolest AI Tools You Haven't Heard About",
  "Assignments & Homework Help", "AI Mini Tools For You", "Best AI for Podcasters",
  "No-Code AI Builders", "AI Tools for Real Estate", "Voice Cloning & Audio AI",
  "Best AI for Students", "Resume & Job Hunting AI", "AI for Indie Game Devs",
  "Meeting Notes & Transcription", "AI Video Editing Suite", "Photography & Editing AI",
  "Startup Toolkit 2026",
];
const TASK_NAMES = [
  "Summarize a document", "Generate marketing copy", "Transcribe a meeting",
  "Remove background from an image", "Write unit tests", "Translate a webpage",
  "Build a chatbot", "Clean a spreadsheet", "Generate a voiceover", "Detect anomalies in data",
];
export const COUNTRY_NAMES = [
  "United States", "United Kingdom", "India", "Germany", "Singapore",
  "Canada", "France", "Japan", "Israel", "Netherlands",
];
const FUNDRAISE_TITLES = [
  "Basalt Labs raises $40M Series B", "Cobalt Intelligence closes $12M seed round",
  "Halcyon AI secures $85M Series C", "Driftwood AI raises $6M pre-seed",
  "Ironclad Systems raises $150M growth round", "Solace Labs closes $22M Series A",
];
const INVESTOR_NAMES = [
  "Northbridge Ventures", "Cascade Capital", "Anchorpoint Partners", "Fieldstone Capital",
  "Greywolf Ventures", "Lighthouse Growth", "Summit Peak Capital", "Vantage Point Partners",
];
const ROBOT_NAMES = [
  "Atlas-X", "Kinera One", "Helix R1", "Sentry Bot", "Orbit Mini", "Forge Arm-2",
  "Shivali", "Lexi", "Raze", "Chutki", "Zara Khan", "Rusha", "Katherine", "Kavya",
  "Lalita", "Aanchal", "Sneha Sharma", "Ishu", "Khushi Mehta", "Pramila Sutar",
  "Luna", "Rashika", "Tsunade", "Sarah", "Hunter", "Supriya", "Bharti", "Thor",
  "Isa", "Meena", "Nova Reyes", "Orion Vale", "Priya Anand", "Marcus Cole",
  "Elena Frost", "Jasper Wren", "Talia Moon", "Dmitri Volk", "Sofia Cruz",
  "Kenji Tanaka", "Amara Diallo", "Felix Stone", "Ines Duarte", "Ravi Malhotra",
  "Sable Vance", "Théo Laurent", "Mira Okafor", "Casper Lind", "Yuki Sato",
  "Delphine Roy", "Omar Haddad", "Ingrid Sol", "Zane Carter", "Freya Nyström",
  "Camila Reyes", "Idris Bakr", "Nadia Volkov",
];
const DEVICE_NAMES = [
  "PixelFrame Pin", "EchoBand Wearable", "SnapLens Glasses", "VoiceOrb Speaker",
  "PocketCompanion", "DeskMate Hub",
];

export const TOOL_TITLES_FOR_STACKS = TOOL_NAMES;

export const CATEGORIES = [
  "Writing", "Coding", "Image Generation", "Video", "Audio", "Productivity",
  "Marketing", "Research", "Data Analysis", "Customer Support",
];

export const REVIEWER_NAMES = [
  "My Sawsiri", "Shvetank Sharma", "Jordan Blake", "Priya Nair", "Tomás Rivera",
  "Aiko Tanaka", "Liam O'Connell", "Fatima Al-Sayed", "Noah Kim", "Elena Petrova",
];

export const REVIEW_QUOTES = [
  "I think it's the best one I've found on the net. It gives more accurate results than I expected, and thanks for keeping it free.",
  "Not at all accurate for my case, honestly. The output only vaguely resembled what I asked for.",
  "Saved me hours of manual work this week. The interface is a little rough but it gets the job done.",
  "Solid for a free tier. I upgraded after the third project and haven't looked back since.",
  "Does exactly what it says, no fuss. Wish the docs were a bit clearer though.",
  "Been using this daily for a month now — reliable, fast, and the support team actually responds.",
];

export const TAG_POOL = [
  "API", "Open Source", "Free Tier", "Agents", "No Signup", "Automation",
  "Enterprise", "Self-Hosted", "MCP", "Realtime", "Multimodal", "Fine-tunable",
];

export const MAX_PRICE = 300;

export const PRICING_OPTIONS = ["Free", "Freemium", "Paid", "Free Trial"];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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
  // Fisher-Yates shuffle. Deliberately NOT `arr.sort(() => rand() - 0.5)`:
  // that comparator isn't a valid (transitive) comparator, so the number of
  // times it gets invoked is implementation-defined and can differ between
  // JS engines (e.g. Node's V8 build vs. a browser's V8 build). Since every
  // entity in this file pulls from one shared seeded `rand()` sequence, an
  // engine-dependent number of rand() calls here desyncs every value
  // generated afterward between server and client, causing React hydration
  // mismatches. Fisher-Yates always calls rand() exactly arr.length - 1
  // times, so the sequence stays in lockstep on every engine.
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

// Fixed anchor for all generated "createdAt" timestamps. Using a constant
// instead of `new Date()`/`Date.now()` keeps mock-data generation fully
// deterministic: the server (at request time) and the client (at hydration,
// moments later) must compute byte-identical output, or React's hydration
// will detect a mismatch and throw the tree away to re-render client-side.
// A live wall-clock reference, called once per entity, drifts by a few
// milliseconds between the two passes — enough to flip the sort order of
// entities whose randomized "days ago" value ties or nearly ties.
const MOCK_DATA_REFERENCE_NOW = new Date("2026-07-01T00:00:00.000Z").getTime();

function daysAgo(n: number): string {
  return new Date(MOCK_DATA_REFERENCE_NOW - n * 24 * 60 * 60 * 1000).toISOString();
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
    const pricing = typeof meta.pricing === "string" ? meta.pricing : undefined;
    const priceAmount = pricing
      ? pricing === "Free"
        ? 0
        : 5 + Math.floor(rand() * 295)
      : undefined;

    entities.push({
      id: `${type}-${idCounter++}`,
      type,
      title,
      slug: slugify(title),
      description,
      category: pick(CATEGORIES, rand),
      tags: pickMany(TAG_POOL, 2 + Math.floor(rand() * 3), rand),
      country: pick(COUNTRY_NAMES, rand),
      priceAmount,
      meta,
      popularityScore: Math.floor(rand() * 10000),
      createdAt: daysAgo(Math.floor(rand() * 400)),
    });
  };

  REAL_TOOLS.forEach((tool) => {
    const id = `tool-${idCounter++}`;
    entities.push({
      id,
      type: "tool",
      title: tool.name,
      slug: slugify(tool.name),
      description: `${tool.name} helps you ${tool.task.toLowerCase()}.`,
      imageUrl: logoForDomain(tool.domain),
      category: tool.category,
      tags: pickMany(TAG_POOL, 2 + Math.floor(rand() * 3), rand),
      country: tool.country,
      priceAmount: tool.pricing === "Free" ? 0 : 5 + Math.floor(rand() * 295),
      meta: {
        pricing: tool.pricing,
        website: tool.domain,
        task: tool.task,
      },
      popularityScore: Math.floor(rand() * 10000),
      createdAt: daysAgo(Math.floor(rand() * 400)),
    });
  });

  // A handful of smaller/legacy placeholder tools, kept so the type-icon
  // fallback (no imageUrl) still has coverage in the demo data.
  TOOL_NAMES.forEach((name) =>
    push("tool", name, `${name} helps teams automate repetitive work using AI, with a focus on speed and simplicity.`, {
      pricing: pick(["Free", "Freemium", "Paid", "Free Trial"], rand),
      website: `${name.toLowerCase().replace(/\s+/g, "")}.ai`,
      task: pick(TASK_NAMES, rand),
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

  TASK_NAMES.forEach((name) =>
    push("task", name, `Browse AI tools that can help you ${name.toLowerCase()}, ranked by popularity.`, {
      toolCount: 10 + Math.floor(rand() * 200),
    })
  );

  COUNTRY_NAMES.forEach((name) =>
    push("country", name, `AI tools and companies founded or headquartered in ${name}.`, {
      toolCount: 20 + Math.floor(rand() * 500),
      companyCount: 5 + Math.floor(rand() * 120),
    })
  );

  FUNDRAISE_TITLES.forEach((title) =>
    push("fundraise", title, `${title}. The round will be used to accelerate product development and hiring.`, {
      amount: `$${(1 + Math.floor(rand() * 150))}M`,
      round: pick(["Pre-seed", "Seed", "Series A", "Series B", "Series C"], rand),
    })
  );

  INVESTOR_NAMES.forEach((name) =>
    push("investor", name, `${name} is a venture capital firm investing in early and growth-stage AI companies.`, {
      portfolioSize: 10 + Math.floor(rand() * 200),
      focus: pick(["Seed", "Early Stage", "Growth", "Multi-stage"], rand),
    })
  );

  ROBOT_NAMES.forEach((name) =>
    push("robot", name, `${name} is an AI-powered robot designed for real-world automation tasks.`, {
      manufacturer: pick(COMPANY_NAMES, rand),
      category: pick(["Humanoid", "Industrial Arm", "Mobile", "Drone"], rand),
    })
  );

  DEVICE_NAMES.forEach((name) =>
    push("device", name, `${name} is an AI-enabled hardware device built for everyday use.`, {
      pricing: pick(PRICING_OPTIONS, rand),
      formFactor: pick(["Wearable", "Handheld", "Desktop", "Glasses"], rand),
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