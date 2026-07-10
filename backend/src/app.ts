import { Hono } from "hono";
import { cors } from "hono/cors";
import { getPrisma } from "./db";
import type { EntityType, EmploymentType, LocationType } from "@prisma/client";

// ---------------------------------------------------------------------------
// Hono app backing the search module's backend. Deployed standalone (see
// src/index.ts for the Cloudflare Workers entry point) — the frontend calls
// it over HTTP via NEXT_PUBLIC_API_BASE_URL, it isn't mounted inside the
// Next.js app anymore. Talks to Postgres (Neon) through Prisma's
// driver-adapter mode — no native query engine binary, so it works in
// edge/serverless environments.
// ---------------------------------------------------------------------------

export type Bindings = {
  DATABASE_URL: string;
  FRONTEND_ORIGIN?: string;
};

export const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

app.use("*", (c, next) =>
  cors({
    // Falls back to "*" (open) if FRONTEND_ORIGIN isn't set, so local dev
    // and first deploys still work without extra config. Set FRONTEND_ORIGIN
    // once you know your deployed frontend's domain to lock this down.
    origin: c.env.FRONTEND_ORIGIN || "*",
  })(c, next)
);

app.get("/health", (c) => c.json({ ok: true }));

// ---------------------------------------------------------------------------
// Generic entity search — backs the existing tools/companies/tasks/etc.
// sections (src/lib/api.ts on the frontend currently reads from in-memory
// mock data; point it at this endpoint to go live).
// ---------------------------------------------------------------------------

const VALID_ENTITY_TYPES = new Set<EntityType>([
  "tool",
  "company",
  "task",
  "news",
  "model",
  "robot",
  "device",
  "video",
  "repository",
  "investor",
  "fundraise",
  "country",
  "collection",
]);

app.get("/entities", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  const typeParam = c.req.query("type");
  const type = VALID_ENTITY_TYPES.has(typeParam as EntityType)
    ? (typeParam as EntityType)
    : undefined;
  const category = c.req.query("category") || undefined;
  const q = c.req.query("q") || undefined;
  const sort = c.req.query("sort") || "popular";
  const page = Math.max(1, Number(c.req.query("page") ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(c.req.query("pageSize") ?? 24) || 24));

  const where = {
    ...(type ? { type } : {}),
    ...(category ? { category } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const orderBy =
    sort === "newest"
      ? ({ createdAt: "desc" } as const)
      : sort === "az"
        ? ({ title: "asc" } as const)
        : ({ popularityScore: "desc" } as const);

  const [items, total] = await Promise.all([
    prisma.entity.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.entity.count({ where }),
  ]);

  return c.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

app.get("/entities/:type/:slug", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const type = c.req.param("type") as EntityType;
  const slug = c.req.param("slug");

  if (!VALID_ENTITY_TYPES.has(type)) {
    return c.json({ error: "Unknown entity type" }, 400);
  }

  const entity = await prisma.entity.findUnique({ where: { type_slug: { type, slug } } });
  if (!entity) return c.json({ error: "Not found" }, 404);
  return c.json({ entity });
});

// ---------------------------------------------------------------------------
// Job Listings (backs JobBoard.tsx)
// ---------------------------------------------------------------------------

const VALID_LOCATION_TYPES = new Set<LocationType>(["ON_SITE", "HYBRID", "REMOTE"]);
const VALID_EMPLOYMENT_TYPES = new Set<EmploymentType>(["FULL_TIME", "PART_TIME", "CONTRACT"]);

app.get("/jobs", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  const position = c.req.query("position") || undefined;
  const company = c.req.query("company") || undefined;
  const locationTypesParam = c.req.queries("locationType") ?? [];
  const locationTypes = locationTypesParam.filter((v): v is LocationType =>
    VALID_LOCATION_TYPES.has(v as LocationType)
  );

  const jobs = await prisma.job.findMany({
    where: {
      ...(position ? { title: { contains: position, mode: "insensitive" } } : {}),
      ...(company ? { company: { contains: company, mode: "insensitive" } } : {}),
      ...(locationTypes.length ? { locationType: { in: locationTypes } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return c.json({ jobs });
});

app.post("/jobs", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const body = await c.req.json<{
    title?: string;
    company?: string;
    logoText?: string;
    logoColor?: string;
    locationType?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    employmentType?: string;
  }>();

  if (!body.title || !body.company) {
    return c.json({ error: "title and company are required" }, 400);
  }
  if (!VALID_LOCATION_TYPES.has(body.locationType as LocationType)) {
    return c.json({ error: "Invalid locationType" }, 400);
  }
  if (!VALID_EMPLOYMENT_TYPES.has(body.employmentType as EmploymentType)) {
    return c.json({ error: "Invalid employmentType" }, 400);
  }

  const job = await prisma.job.create({
    data: {
      title: body.title,
      company: body.company,
      logoText: body.logoText || body.company.slice(0, 2).toUpperCase(),
      logoColor: body.logoColor || "#3B82F6",
      locationType: body.locationType as LocationType,
      location: body.location ?? null,
      salaryMin: body.salaryMin ?? 0,
      salaryMax: body.salaryMax ?? 0,
      employmentType: body.employmentType as EmploymentType,
    },
  });

  return c.json({ job }, 201);
});

// ---------------------------------------------------------------------------
// Forum (backs ForumBoard.tsx)
// ---------------------------------------------------------------------------

app.get("/forum/categories", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const categories = await prisma.forumCategory.findMany({ orderBy: { name: "asc" } });
  return c.json({ categories });
});

app.get("/forum/topics", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const categoryName = c.req.query("category") || undefined;
  const tag = c.req.query("tag") || undefined;
  const sort = c.req.query("sort") || "latest"; // "latest" | "hot"

  const topics = await prisma.forumTopic.findMany({
    where: {
      ...(categoryName ? { category: { name: categoryName } } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
    },
    include: { category: true },
    orderBy: sort === "hot" ? { views: "desc" } : { createdAt: "desc" },
    take: 100,
  });

  return c.json({ topics });
});

app.post("/forum/topics", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const body = await c.req.json<{
    title?: string;
    excerpt?: string;
    categoryId?: string;
    tags?: string[];
  }>();

  if (!body.title || !body.excerpt || !body.categoryId) {
    return c.json({ error: "title, excerpt and categoryId are required" }, 400);
  }

  const topic = await prisma.forumTopic.create({
    data: {
      title: body.title,
      excerpt: body.excerpt,
      categoryId: body.categoryId,
      tags: body.tags ?? [],
    },
    include: { category: true },
  });

  return c.json({ topic }, 201);
});

// ---------------------------------------------------------------------------
// Newsletter (backs NewsletterBoard.tsx)
// ---------------------------------------------------------------------------

app.get("/newsletter/posts", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const featured = c.req.query("featured");
  const q = c.req.query("q") || undefined;
  const page = Math.max(1, Number(c.req.query("page") ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(c.req.query("pageSize") ?? 9) || 9));

  const where = {
    ...(featured !== undefined ? { featured: featured === "true" } : {}),
    ...(q
      ? {
          OR: [
            { headline: { contains: q, mode: "insensitive" as const } },
            { excerpt: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.newsletterPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.newsletterPost.count({ where }),
  ]);

  return c.json({ posts, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
});

// ---------------------------------------------------------------------------
// AI Tool Requests (backs RequestsList.tsx)
// ---------------------------------------------------------------------------

app.get("/requests", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const q = c.req.query("q") || undefined;

  const requests = await prisma.toolRequest.findMany({
    where: q ? { title: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { votes: "desc" },
    take: 100,
  });

  return c.json({ requests });
});

app.post("/requests", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const body = await c.req.json<{ title?: string; category?: string; tags?: string[] }>();

  if (!body.title || !body.category) {
    return c.json({ error: "title and category are required" }, 400);
  }

  const request = await prisma.toolRequest.create({
    data: { title: body.title, category: body.category, tags: body.tags ?? [] },
  });

  return c.json({ request }, 201);
});

app.post("/requests/:id/vote", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const id = c.req.param("id");
  const body = await c.req
    .json<{ direction?: "up" | "down" }>()
    .catch<{ direction?: "up" | "down" }>(() => ({}));
  const delta = body.direction === "down" ? -1 : 1;

  try {
    const request = await prisma.toolRequest.update({
      where: { id },
      data: { votes: { increment: delta } },
    });
    return c.json({ request });
  } catch {
    return c.json({ error: "Request not found" }, 404);
  }
});

export type AppType = typeof app;