/**
 * Base URL of the standalone Global Search API (Hono + Prisma, deployed to
 * Cloudflare Workers — see the sibling `backend/` project). The frontend no
 * longer has its own /api routes, so every fetch() in the board components
 * goes through this.
 *
 * Set NEXT_PUBLIC_API_BASE_URL in .env.local for local dev (defaults to
 * `wrangler dev`'s default port) and in your hosting platform's environment
 * variables for production, pointed at the deployed Worker's URL.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8787";
