"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Mail, Search as SearchIcon, Clock, Sparkles } from "lucide-react";

// ---------------------------------------------------------------------------
// Self-contained mock dataset. Newsletter posts aren't a real entity type in
// the search module yet (see src/types/entities.ts) — this generates a
// large, deterministic set of posts client-side. Swap `buildPosts()` for a
// real fetch once a `post` entity type + API endpoint exist.
// ---------------------------------------------------------------------------

interface Post {
  id: string;
  eyebrow: string;
  headline: string;
  excerpt: string;
  readMinutes: number;
  date: string;
  accent: string;
}

const POST_SEEDS: { eyebrow: string; headline: string; excerpt: string }[] = [
  {
    eyebrow: "PROMPT PACK",
    headline: "The Ultimate AI Prompt Pack Is Here",
    excerpt:
      "50+ tested prompts across writing, code, and design, plus the exact workflows we use every week.",
  },
  {
    eyebrow: "USAGE DATA",
    headline: "20,000 Tasks Decoded",
    excerpt:
      "A new study breaks down what people actually use AI tools for — and the results aren't what you'd expect.",
  },
  {
    eyebrow: "WEEKLY RECAP",
    headline: "This Week In AI: Your Recap",
    excerpt: "The key news, stories, and breakthroughs you may have missed this week.",
  },
  {
    eyebrow: "MODEL LAUNCH",
    headline: "GPT-5.6 And a New Coding Assistant Drop",
    excerpt:
      "Two major model updates landed within hours of each other — here's what changed under the hood.",
  },
  {
    eyebrow: "PREDICTIONS",
    headline: "Experts Predicted AI 2,500 Years Ago",
    excerpt: "Ancient Greek texts described automation with eerie accuracy. We dug up the receipts.",
  },
  {
    eyebrow: "ENTERTAINMENT",
    headline: "AI Lands a Lead Movie Role",
    excerpt:
      "A film festival hosted a feature film starring an AI-generated actor — reactions were mixed.",
  },
  {
    eyebrow: "TOOLS ROUNDUP",
    headline: "June's Hottest AI Tools",
    excerpt:
      "The tools that dominated last month's search traffic and what that says about where things are headed.",
  },
  {
    eyebrow: "SECURITY",
    headline: "The Rise of AI Voice Scams",
    excerpt: "Voice cloning scams cost victims real money last quarter. Here's how to spot one.",
  },
  {
    eyebrow: "HARDWARE",
    headline: "Compute Comes Online for a New AI Factory",
    excerpt: "A next-gen data center went live this week, promising a big jump in training capacity.",
  },
  {
    eyebrow: "PRODUCT",
    headline: "AI-Powered Shoe Design, Explained",
    excerpt: "A footwear startup is using generative design to cut prototyping time in half.",
  },
  {
    eyebrow: "ADOPTION",
    headline: "1,362 Real Ways People Use AI",
    excerpt: "We surveyed thousands of users across industries. Here's the breakdown by job and task.",
  },
  {
    eyebrow: "DEEP DIVE",
    headline: "Inside the Agents Powering Your Inbox",
    excerpt: "Autonomous agents are quietly triaging email for millions of people. How well do they work?",
  },
  {
    eyebrow: "FUNDING",
    headline: "A Quiet Startup Just Raised $60M",
    excerpt: "The round flew under the radar, but the roadmap it's funding could shake up the market.",
  },
  {
    eyebrow: "OPINION",
    headline: "Why Everyone's Prompting Wrong",
    excerpt: "Small changes to how you phrase a request can double the quality of your output.",
  },
  {
    eyebrow: "RESEARCH",
    headline: "A New Benchmark Just Reshuffled the Rankings",
    excerpt: "Open-source models closed the gap with frontier labs on this closely-watched test.",
  },
];

function seededRandom(seed: number) {
  let t = seed;
  return () => {
    t = (t * 1103515245 + 12345) % 2147483648;
    return t / 2147483648;
  };
}

const ACCENTS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#EF4444", "#06B6D4"];

function buildPosts(count: number): Post[] {
  const rand = seededRandom(11);
  const posts: Post[] = [];
  for (let i = 0; i < count; i++) {
    const seed = POST_SEEDS[i % POST_SEEDS.length];
    const daysAgo = Math.floor(rand() * 120) + Math.floor(i / POST_SEEDS.length) * 7;
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    posts.push({
      id: `post-${i + 1}`,
      eyebrow: seed.eyebrow,
      headline: seed.headline,
      excerpt: seed.excerpt,
      readMinutes: 2 + Math.floor(rand() * 8),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      accent: ACCENTS[Math.floor(rand() * ACCENTS.length)],
    });
  }
  return posts;
}

const ALL_POSTS = buildPosts(93);
const FEATURED = ALL_POSTS.slice(0, 3);
const REST = ALL_POSTS.slice(3);

function PostThumbnail({ post, tall = false }: { post: Post; tall?: boolean }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-t-lg ${
        tall ? "h-32" : "h-28"
      }`}
    >
      <Image
        src={`https://picsum.photos/seed/${post.id}/640/400`}
        alt=""
        fill
        sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
        className="object-cover"
      />
      {/* Scrim so the eyebrow text and badge stay legible over any photo */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${post.accent}55 0%, rgba(11,11,15,0.55) 55%, rgba(11,11,15,0.75) 100%)`,
        }}
      />
      <p className="relative px-4 text-center text-sm font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow-sm">
        {post.eyebrow}
      </p>
      <span
        className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full"
        style={{ backgroundColor: post.accent }}
      >
        <Sparkles size={10} className="text-white" />
      </span>
    </div>
  );
}

function PostCard({ post, tall = false }: { post: Post; tall?: boolean }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-border-hover">
      <PostThumbnail post={post} tall={tall} />
      <div className="p-3.5">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-text-tertiary">
          <Clock size={10} />
          {post.readMinutes} min read · {post.date}
        </div>
        <h3 className="mb-1.5 line-clamp-2 text-sm font-semibold text-accent-hover hover:text-accent">
          {post.headline}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs text-text-secondary">{post.excerpt}</p>
        <div className="flex items-center gap-1.5 border-t border-border pt-2.5 text-[11px] text-text-tertiary">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Sparkles size={9} />
          </span>
          The AI Signal
        </div>
      </div>
    </article>
  );
}

export function NewsletterBoard() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return REST;
    const q = query.trim().toLowerCase();
    return REST.filter(
      (p) => p.headline.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div>
      {/* Hero / subscribe */}
      <section className="hero-glow mb-10 -mx-4 rounded-xl border border-border bg-surface px-4 py-10 text-center sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Mail size={18} />
        </span>
        <h1 className="brand-wordmark text-3xl text-text-primary sm:text-4xl">The&nbsp;AI&nbsp;Signal</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-text-secondary">
          The AI newsletter read and trusted by over 2.5 million readers, including engineers at
          Google, Meta, Microsoft, Amazon, OpenAI, Apple, Tesla, and Salesforce.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-6 flex max-w-md flex-col gap-2.5 sm:flex-row"
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary hover:border-border-hover focus:border-border-hover"
          />
          <button
            type="submit"
            className="shrink-0 whitespace-nowrap rounded-md bg-highlight px-4 py-2.5 text-sm font-semibold text-highlight-text transition-colors hover:brightness-110"
          >
            Join 2.5M+ readers
          </button>
        </form>
        <p className="mx-auto mt-3 max-w-md text-[11px] text-text-tertiary">
          By subscribing you agree to receive our newsletter and accept our Terms and Privacy
          Policy. Unsubscribe anytime.
        </p>
      </section>

      {/* Featured posts */}
      <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
        Featured Posts
      </div>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURED.map((post) => (
          <PostCard key={post.id} post={post} tall />
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <SearchIcon
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full rounded-md border border-border bg-surface py-2 pl-8 pr-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary hover:border-border-hover focus:border-border-hover"
        />
      </div>

      {/* Post grid */}
      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-secondary">
          No posts match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}