import { app } from "./app";

// Cloudflare Workers looks for a default export with a `fetch` method — a
// Hono app already implements that interface directly, so this file is
// just the deploy target's entry point, nothing else lives here.
export default app;
