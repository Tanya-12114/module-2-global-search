"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Mail, Search as SearchIcon, Clock, Sparkles } from "lucide-react";
import { Pagination } from "@/components/search/Pagination";
import { ErrorState } from "@/components/search/states/ErrorState";
import { API_BASE_URL } from "@/lib/apiBaseUrl";

// ---------------------------------------------------------------------------
// Fetches from /api/newsletter/posts (src/server/app.ts), backed by Postgres
// via Prisma. Featured posts and the paginated grid are two separate
// requests (?featured=true vs ?featured=false) so the same post never shows
// up twice.
// ---------------------------------------------------------------------------

interface Post {
  id: string;
  eyebrow: string;
  headline: string;
  excerpt: string;
  readMinutes: number;
  accent: string;
  imageSeed: string;
  publishedAt: string;
}

const PAGE_SIZE = 9;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function PostThumbnail({ post, tall = false }: { post: Post; tall?: boolean }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-t-lg ${
        tall ? "h-32" : "h-28"
      }`}
    >
      <Image
        src={`https://picsum.photos/seed/${post.imageSeed}/640/400`}
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
          {post.readMinutes} min read · {formatDate(post.publishedAt)}
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

function PostCardSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className={`skeleton ${tall ? "h-32" : "h-28"} rounded-none`} />
      <div className="space-y-2 p-3.5">
        <div className="skeleton h-2.5 w-1/3 rounded" />
        <div className="skeleton h-3.5 w-3/4 rounded" />
        <div className="skeleton h-2.5 w-full rounded" />
      </div>
    </div>
  );
}

export function NewsletterBoard() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [featured, setFeatured] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/newsletter/posts?featured=true&pageSize=3`)
      .then((res) => res.json())
      .then((data: { posts: Post[] }) => setFeatured(data.posts))
      .catch(() => {
        /* Featured row just renders empty on failure — the main grid fetch
           below surfaces the real error state. */
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      featured: "false",
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (query.trim()) params.set("q", query.trim());

    fetch(`${API_BASE_URL}/api/newsletter/posts?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data: { posts: Post[]; totalPages: number }) => {
        if (!cancelled) {
          setPosts(data.posts);
          setTotalPages(data.totalPages);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load newsletter posts. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, page, retryToken]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

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
      {featured.length > 0 && (
        <>
          <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Featured Posts
          </div>
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {featured.map((post) => (
              <PostCard key={post.id} post={post} tall />
            ))}
          </div>
        </>
      )}

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <SearchIcon
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search"
          className="w-full rounded-md border border-border bg-surface py-2 pl-8 pr-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary hover:border-border-hover focus:border-border-hover"
        />
      </div>

      {/* Post grid */}
      {error ? (
        <ErrorState message={error} onRetry={() => setRetryToken((t) => t + 1)} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-secondary">
          No posts match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {!isLoading && !error && totalPages > 1 && (
        <div className="mt-8">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
