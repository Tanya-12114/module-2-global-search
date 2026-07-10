"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon, Plus, MessageSquare, CheckCircle2 } from "lucide-react";
import { ErrorState } from "@/components/search/states/ErrorState";
import { API_BASE_URL } from "@/lib/apiBaseUrl";

// ---------------------------------------------------------------------------
// Fetches from /api/requests (src/server/app.ts), backed by Postgres via
// Prisma. Voting hits POST /api/requests/:id/vote. There's no user-account
// system yet, so votes are a global counter, not per-user — "My requests"
// below tracks which cards *this browser* has voted on, client-side only.
// ---------------------------------------------------------------------------

interface ToolRequest {
  id: string;
  title: string;
  category: string;
  tags: string[];
  votes: number;
  fulfilled: boolean;
  createdAt: string;
}

function daysAgo(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

const TABS = ["All", "My requests"] as const;
type Tab = (typeof TABS)[number];

function RequestRowSkeleton() {
  return (
    <div className="flex items-stretch gap-3">
      <div className="skeleton w-24 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2 rounded-xl border border-border bg-surface p-4">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function RequestsList() {
  const [tab, setTab] = useState<Tab>("All");
  const [query, setQuery] = useState("");
  const [myVotes, setMyVotes] = useState<Record<string, boolean>>({});

  const [requests, setRequests] = useState<ToolRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/api/requests`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data: { requests: ToolRequest[] }) => {
        if (!cancelled) setRequests(data.requests);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load requests. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  async function toggleVote(id: string) {
    const alreadyVoted = !!myVotes[id];
    setMyVotes((prev) => ({ ...prev, [id]: !alreadyVoted }));
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, votes: r.votes + (alreadyVoted ? -1 : 1) } : r))
    );

    try {
      await fetch(`${API_BASE_URL}/api/requests/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: alreadyVoted ? "down" : "up" }),
      });
    } catch {
      // Optimistic update already applied — a failed vote just means the
      // count drifts from the server until the next refetch. Not worth a
      // visible error for a single vote click.
    }
  }

  const filtered = useMemo(() => {
    let list = requests;
    if (tab === "My requests") {
      list = list.filter((r) => myVotes[r.id]);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q));
    }
    return list;
  }, [requests, tab, myVotes, query]);

  const fulfilledCount = useMemo(() => requests.filter((r) => r.fulfilled).length, [requests]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <MessageSquare size={18} />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">AI Tool Requests</h1>
            <p className="max-w-md text-sm text-text-secondary">
              Looking for a specific AI tool? Post a request and someone will help you find it —
              the community might even build it.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 rounded-xl border border-border bg-surface px-5 py-3">
          <div className="text-center">
            <p className="text-xl font-semibold tabular-nums text-text-primary">{fulfilledCount}</p>
            <p className="text-[11px] text-text-tertiary">requests fulfilled</p>
          </div>
          <button
            type="button"
            title="Hook this up to a form that POSTs to /api/requests"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-text-primary px-3.5 py-2 text-xs font-semibold text-bg transition-colors hover:bg-accent hover:text-white"
          >
            <Plus size={13} />
            View request
          </button>
        </div>
      </div>

      {/* Tabs + search */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                tab === t ? "bg-text-primary text-bg" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative">
          <SearchIcon
            size={13}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search requests…"
            className="w-56 rounded-full border border-border bg-surface py-1.5 pl-8 pr-3 text-xs text-text-primary outline-none placeholder:text-text-tertiary hover:border-border-hover focus:border-border-hover"
          />
        </div>
      </div>

      {/* List */}
      {error ? (
        <ErrorState message={error} onRetry={() => setRetryToken((t) => t + 1)} />
      ) : isLoading ? (
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RequestRowSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {filtered.map((request) => {
            const voted = !!myVotes[request.id];
            const timeLabel = daysAgo(request.createdAt) <= 0 ? "today" : `${daysAgo(request.createdAt)}d ago`;

            return (
              <div key={request.id} className="flex items-stretch gap-3">
                {/* Vote box */}
                <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-surface px-2 py-4 text-center">
                  <p className="text-2xl font-bold leading-none tabular-nums text-text-primary">
                    {request.votes}
                  </p>
                  <p className="text-[11px] text-text-tertiary">{request.votes === 1 ? "vote" : "votes"}</p>
                  <button
                    type="button"
                    onClick={() => toggleVote(request.id)}
                    aria-pressed={voted}
                    aria-label={`Upvote ${request.title}`}
                    className={`mt-2 w-full rounded-md px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                      voted ? "bg-warning/40 text-warning" : "bg-warning text-black hover:bg-warning/90"
                    }`}
                  >
                    Vote
                  </button>
                </div>

                {/* Content card */}
                <div className="group flex min-w-0 flex-1 items-center rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-hover">
                  <div className="min-w-0 flex-1">
                    <Link href="#" className="block">
                      <h3 className="text-[17px] font-bold leading-snug text-text-primary group-hover:text-accent">
                        {request.title}
                      </h3>
                    </Link>

                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                      <span className="rounded-full bg-surface-active px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                        {request.category}
                      </span>
                      {request.tags.map((tag) => (
                        <span key={tag} className="text-text-secondary">
                          #{tag}
                        </span>
                      ))}
                      {request.fulfilled && (
                        <span className="inline-flex items-center gap-1 text-success">
                          <CheckCircle2 size={12} />
                          Fulfilled
                        </span>
                      )}
                      <span>· {timeLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-text-secondary">
              {tab === "My requests"
                ? "You haven't voted on any requests yet."
                : `No requests match "${query}".`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
