# Global Search API

Standalone backend for the Global Search module's Job Listings, Forum,
Newsletter, and AI Tool Requests boards. Node.js/Hono, deployed to
Cloudflare Workers, talking to Postgres (Neon) through Prisma's
driver-adapter mode — no native query engine binary, so it runs on the
edge.

The frontend (a separate Next.js project) calls this over plain HTTP via
`NEXT_PUBLIC_API_BASE_URL` — there's no code-level coupling between the two,
just an HTTP contract (see [API routes](#api-routes) below).

## Structure

```
prisma/
  schema.prisma   Entity (generic — for the frontend's core search module,
                   not yet wired up, see note below) + Job, ForumCategory,
                   ForumTopic, NewsletterPost, ToolRequest
  seed.ts         populates Job/Forum/Newsletter/Requests tables
src/
  db.ts           Prisma client (Neon driver adapter)
  app.ts          the Hono app — every route lives here
  index.ts        Cloudflare Workers entry point (exports the Hono app)
wrangler.toml     Workers deploy config
```

## Setup

1. `npm install`
2. Copy `.dev.vars.example` to **both** `.dev.vars` and `.env` (Wrangler
   reads `.dev.vars` for local dev; the Prisma CLI reads `.env`). Set
   `DATABASE_URL` to your Neon connection string (pooled, `?sslmode=require`).
3. `npm run db:generate` — generates the Prisma client. **Requires network
   access to `binaries.prisma.sh`** the first time.
4. `npm run db:migrate` — creates the tables.
5. `npm run db:seed` — populates Job/Forum/Newsletter/Requests.
6. `npm run dev` — starts `wrangler dev`, serving on `http://localhost:8787`.

## Deploying

```bash
wrangler secret put DATABASE_URL   # once, per environment
npm run deploy
```

Point the frontend's `NEXT_PUBLIC_API_BASE_URL` at the resulting
`*.workers.dev` URL (or a custom domain, once you attach one via the
Cloudflare dashboard).

## API routes

| Route | Backs |
|---|---|
| `GET /api/entities?type=&category=&q=&sort=&page=` | frontend's core search module — schema exists, not wired up or seeded yet |
| `GET /api/entities/:type/:slug` | entity detail pages (same caveat) |
| `GET /api/jobs`, `POST /api/jobs` | Job Listings board |
| `GET /api/forum/categories`, `GET /api/forum/topics`, `POST /api/forum/topics` | Forum board |
| `GET /api/newsletter/posts` | Newsletter board |
| `GET /api/requests`, `POST /api/requests`, `POST /api/requests/:id/vote` | AI Tool Requests board |

## CORS

`src/app.ts` calls Hono's `cors()` middleware with no options, which
allows any origin — fine for development, too permissive for production.
Once you know the frontend's deployed domain, lock it down:

```ts
app.use("*", cors({ origin: "https://your-frontend-domain.com" }));
```
