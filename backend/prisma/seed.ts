/**
 * Seeds the Job/Forum/Newsletter/Requests boards. Run with `npm run db:seed`
 * (requires DATABASE_URL to be set — see .env.example).
 *
 * This runs on plain Node.js, so it uses the standard PrismaClient — no
 * driver adapter needed here, that's only required for the edge deploy in
 * src/app.ts.
 *
 * NOTE: the generic `Entity` table (see schema.prisma) isn't seeded here.
 * The frontend's core search module still reads from its own local mock
 * data (src/lib/mockData.ts in the frontend project) rather than this API —
 * see the frontend README for how to cut it over. Once that happens, seed
 * Entity rows from whatever replaces that mock data, not from here.
 */
import { PrismaClient, type LocationType, type EmploymentType } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Job Listings
// ---------------------------------------------------------------------------

const JOB_COMPANIES: { name: string; logoText: string; logoColor: string }[] = [
  { name: "Twitch", logoText: "TW", logoColor: "#6441A5" },
  { name: "The Nuclear Company", logoText: "N", logoColor: "#111827" },
  { name: "Edison Scientific", logoText: "ES", logoColor: "#374151" },
  { name: "McMee", logoText: "M", logoColor: "#DC2626" },
  { name: "Quantcast", logoText: "Q", logoColor: "#14B8A6" },
  { name: "MD Education", logoText: "MD", logoColor: "#DB2777" },
  { name: "MailerLite", logoText: "ML", logoColor: "#22C55E" },
  { name: "Ofgem", logoText: "OF", logoColor: "#F59E0B" },
  { name: "CARMA", logoText: "CA", logoColor: "#2563EB" },
  { name: "Future", logoText: "F", logoColor: "#0F172A" },
  { name: "Reddit", logoText: "RD", logoColor: "#FF4500" },
  { name: "Synechron", logoText: "S", logoColor: "#6B7280" },
  { name: "Northwind AI", logoText: "N", logoColor: "#3B82F6" },
  { name: "Basalt Labs", logoText: "B", logoColor: "#0EA5E9" },
  { name: "Meridian Systems", logoText: "M", logoColor: "#8B5CF6" },
];

const JOB_TITLES = [
  "Data Scientist",
  "AI Strategy Analyst",
  "AI Engineer",
  "Lead AI Engineer",
  "Machine Learning Engineer",
  "AI Content Producer (f/m/x)",
  "Senior AI Engineer",
  "Senior Economist — Effects of Transformative AI",
  "Applied AI Engineer",
  "Senior Machine Learning Systems Engineer, Ranking Platform",
  "Research Scientist",
  "Prompt Engineer",
  "MLOps Engineer",
  "Computer Vision Engineer",
  "NLP Engineer",
  "AI Product Manager",
];

const CITIES = [
  "San Francisco, CA, United States",
  "Washington, DC, United States",
  "Boston, MA, United States",
  "Frisco, TX, United States",
  "Vienna, Austria",
  "London, United Kingdom",
  "Pittsburgh, PA, United States",
  "New York, NY, United States",
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

async function seedJobs() {
  const count = 56;
  console.log(`Seeding ${count} jobs…`);
  const rand = seededRandom(7);

  await prisma.job.deleteMany();

  const jobs = Array.from({ length: count }, () => {
    const company = pick(JOB_COMPANIES, rand);
    const locationType = pick<LocationType>(["ON_SITE", "HYBRID", "REMOTE"], rand);
    const employmentType = pick<EmploymentType>(
      ["FULL_TIME", "FULL_TIME", "FULL_TIME", "PART_TIME", "CONTRACT"],
      rand
    );
    const salaryMin = Math.round((60_000 + rand() * 180_000) / 1000) * 1000;
    const salaryMax = salaryMin + 20_000 + Math.floor(rand() * 120_000);

    return {
      title: pick(JOB_TITLES, rand),
      company: company.name,
      logoText: company.logoText,
      logoColor: company.logoColor,
      locationType,
      location: locationType === "REMOTE" ? null : pick(CITIES, rand),
      salaryMin,
      salaryMax,
      employmentType,
    };
  });

  await prisma.job.createMany({ data: jobs });
}

// ---------------------------------------------------------------------------
// Forum
// ---------------------------------------------------------------------------

const FORUM_CATEGORIES = [
  { name: "AI Builders", color: "#F97316" },
  { name: "AI Users", color: "#3B82F6" },
  { name: "General", color: "#22C55E" },
  { name: "Site Feedback", color: "#9CA3AF" },
];

const FORUM_TOPIC_SEEDS: { title: string; excerpt: string }[] = [
  {
    title: "Welcome to the AI community",
    excerpt:
      "Welcome! Here we discuss everything AI from the point of view of people using AI, but also people building AI tools.",
  },
  {
    title: "One API Marketplace For All AI Models",
    excerpt: "Has anyone found a single marketplace that actually aggregates every model provider cleanly?",
  },
  {
    title: "Who can mentor a no-coder on apps building?",
    excerpt: "Looking for someone patient enough to walk me through shipping my first AI-powered app.",
  },
  {
    title: "Why building around a single AI model is starting to feel risky",
    excerpt: "Pricing changes and rate limits from a single provider nearly broke our roadmap last month.",
  },
  {
    title: "Can AI ever feel emotionally intelligent to you?",
    excerpt: "Curious how many of you have had a genuinely comforting conversation with a model.",
  },
  {
    title: "How to clean up videos?",
    excerpt: "What's everyone using these days for quick denoise + upscale passes on old footage?",
  },
  {
    title: "Anyone else hitting rate limits constantly?",
    excerpt: "Curious if others are seeing the same throttling this week or if it's just our account.",
  },
  {
    title: "Feedback on the new search page",
    excerpt: "The new layout is a big improvement, but the mobile filters could use some polish.",
  },
];

async function seedForum() {
  console.log("Seeding forum categories and topics…");

  await prisma.forumTopic.deleteMany();
  await prisma.forumCategory.deleteMany();

  const categories = await Promise.all(
    FORUM_CATEGORIES.map((c) => prisma.forumCategory.create({ data: c }))
  );

  const rand = seededRandom(23);
  const count = 40;

  for (let i = 0; i < count; i++) {
    const seed = FORUM_TOPIC_SEEDS[i % FORUM_TOPIC_SEEDS.length];
    const category = pick(categories, rand);
    const isFirst = i === 0;

    await prisma.forumTopic.create({
      data: {
        title: seed.title,
        excerpt: seed.excerpt,
        categoryId: category.id,
        tags: rand() > 0.6 ? ["chatgpt", "tools"].slice(0, 1) : [],
        replies: isFirst ? 1 : Math.floor(rand() * 22),
        views: isFirst ? 5000 : Math.floor(rand() * 900),
        pinned: isFirst,
        locked: isFirst,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

const NEWSLETTER_POST_SEEDS: { eyebrow: string; headline: string; excerpt: string; accent: string }[] = [
  {
    eyebrow: "PROMPT PACK",
    headline: "The Ultimate AI Prompt Pack Is Here",
    excerpt:
      "50+ tested prompts across writing, code, and design, plus the exact workflows we use every week.",
    accent: "#3B82F6",
  },
  {
    eyebrow: "USAGE DATA",
    headline: "20,000 Tasks Decoded",
    excerpt:
      "A new study breaks down what people actually use AI tools for — and the results aren't what you'd expect.",
    accent: "#22C55E",
  },
  {
    eyebrow: "WEEKLY RECAP",
    headline: "This Week In AI: Your Recap",
    excerpt: "The key news, stories, and breakthroughs you may have missed this week.",
    accent: "#8B5CF6",
  },
  {
    eyebrow: "MODEL LAUNCH",
    headline: "GPT-5.6 And a New Coding Assistant Drop",
    excerpt: "Two major model updates landed within hours of each other — here's what changed under the hood.",
    accent: "#F59E0B",
  },
  {
    eyebrow: "SECURITY",
    headline: "The Rise of AI Voice Scams",
    excerpt: "Voice cloning scams cost victims real money last quarter. Here's how to spot one.",
    accent: "#EF4444",
  },
  {
    eyebrow: "ADOPTION",
    headline: "1,362 Real Ways People Use AI",
    excerpt: "We surveyed thousands of users across industries. Here's the breakdown by job and task.",
    accent: "#06B6D4",
  },
];

async function seedNewsletter() {
  const count = 93;
  console.log(`Seeding ${count} newsletter posts…`);
  await prisma.newsletterPost.deleteMany();

  const rand = seededRandom(11);
  const posts = Array.from({ length: count }, (_, i) => {
    const seed = NEWSLETTER_POST_SEEDS[i % NEWSLETTER_POST_SEEDS.length];
    const daysAgo = Math.floor(rand() * 120) + Math.floor(i / NEWSLETTER_POST_SEEDS.length) * 7;
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - daysAgo);

    return {
      eyebrow: seed.eyebrow,
      headline: seed.headline,
      excerpt: seed.excerpt,
      accent: seed.accent,
      readMinutes: 2 + Math.floor(rand() * 8),
      imageSeed: `post-${i + 1}`,
      featured: i < 3,
      publishedAt,
    };
  });

  await prisma.newsletterPost.createMany({ data: posts });
}

// ---------------------------------------------------------------------------
// AI Tool Requests
// ---------------------------------------------------------------------------

const REQUEST_SEEDS: { title: string; category: string; tags: string[] }[] = [
  { title: "AI for designing easy flat cutting dimensions", category: "AI tool", tags: ["design"] },
  { title: "AI tool to create anime and cartoons for adults and kids", category: "AI tool", tags: ["3d cartoon"] },
  { title: "AI tool for literature review", category: "AI tool", tags: ["research"] },
  { title: "Easy convert excel file into 2D rooms plans / floor plans", category: "AI tool", tags: ["real estate"] },
  { title: "Search supplier", category: "AI tool", tags: ["app-app"] },
  { title: "Image upload", category: "AI tool", tags: ["voice cloning"] },
  { title: "Numbers combination tools", category: "AI tool", tags: [] },
  { title: "AI tool to help publish Chrome extensions faster", category: "AI tool", tags: ["ideas"] },
  { title: "AI tool for donations", category: "AI tool", tags: [] },
  { title: "AI Professional Course Pilot", category: "AI tool", tags: [] },
  { title: "Free PDF to Excel AI Tool (OCR)", category: "AI tool", tags: [] },
  { title: "Free GPT Image 2 generator", category: "AI tool", tags: [] },
];

async function seedRequests() {
  console.log(`Seeding ${REQUEST_SEEDS.length} tool requests…`);
  await prisma.toolRequest.deleteMany();

  const rand = seededRandom(3);
  const requests = REQUEST_SEEDS.map((r) => ({
    ...r,
    votes: 1 + Math.floor(rand() * 5),
    fulfilled: rand() > 0.85,
  }));

  await prisma.toolRequest.createMany({ data: requests });
}

async function main() {
  await seedJobs();
  await seedForum();
  await seedNewsletter();
  await seedRequests();
  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
