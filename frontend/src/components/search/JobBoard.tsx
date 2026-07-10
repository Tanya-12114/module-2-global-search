"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Building2,
  Home,
  Globe2,
  DollarSign,
  SearchIcon,
  Plus,
} from "lucide-react";
import { ErrorState } from "@/components/search/states/ErrorState";
import { API_BASE_URL } from "@/lib/apiBaseUrl";

// ---------------------------------------------------------------------------
// Fetches from /api/jobs (src/server/app.ts), backed by Postgres via Prisma.
// Filters are applied server-side through query params.
// ---------------------------------------------------------------------------

type ApiLocationType = "ON_SITE" | "HYBRID" | "REMOTE";
type ApiEmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT";

interface Job {
  id: string;
  title: string;
  company: string;
  logoText: string;
  logoColor: string;
  locationType: ApiLocationType;
  location: string | null;
  salaryMin: number;
  salaryMax: number;
  employmentType: ApiEmploymentType;
  createdAt: string;
}

const LOCATION_LABEL: Record<ApiLocationType, string> = {
  ON_SITE: "On-site",
  HYBRID: "Hybrid",
  REMOTE: "Remote",
};

const EMPLOYMENT_LABEL: Record<ApiEmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
};

function formatPostedAgo(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return minutes <= 1 ? "1 minute ago" : `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

function formatSalary(n: number): string {
  return `$${n.toLocaleString()}`;
}

function LocationIcon({ type }: { type: ApiLocationType }) {
  if (type === "ON_SITE") return <Building2 size={11} className="text-text-tertiary" />;
  if (type === "HYBRID") return <Home size={11} className="text-text-tertiary" />;
  return <Globe2 size={11} className="text-text-tertiary" />;
}

function JobLogo({ text, color }: { text: string; color: string }) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold uppercase text-white"
      style={{ backgroundColor: color }}
    >
      {text.slice(0, 2)}
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-start gap-2.5">
        <div className="skeleton h-10 w-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="skeleton h-3.5 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="skeleton h-2.5 w-2/3 rounded" />
        <div className="skeleton h-2.5 w-1/2 rounded" />
      </div>
    </div>
  );
}

const LOCATION_TYPE_OPTIONS: { value: ApiLocationType; icon: typeof Building2 }[] = [
  { value: "ON_SITE", icon: Building2 },
  { value: "HYBRID", icon: Home },
  { value: "REMOTE", icon: Globe2 },
];

export function JobBoard() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [positionInput, setPositionInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [locationTypes, setLocationTypes] = useState<Set<ApiLocationType>>(new Set());
  const [appliedPosition, setAppliedPosition] = useState("");
  const [appliedCompany, setAppliedCompany] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  function toggleLocationType(value: ApiLocationType) {
    setLocationTypes((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function runSearch() {
    setAppliedPosition(positionInput);
    setAppliedCompany(companyInput);
  }

  const locationTypesKey = useMemo(() => [...locationTypes].sort().join(","), [locationTypes]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (appliedPosition.trim()) params.set("position", appliedPosition.trim());
    if (appliedCompany.trim()) params.set("company", appliedCompany.trim());
    locationTypes.forEach((t) => params.append("locationType", t));

    fetch(`${API_BASE_URL}/api/jobs?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data: { jobs: Job[] }) => {
        if (!cancelled) setJobs(data.jobs);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load job listings. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedPosition, appliedCompany, locationTypesKey, retryToken]);

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Job Listings</h1>
        <button
          type="button"
          title="Hook this up to a form that POSTs to /api/jobs"
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <Plus size={14} />
          Create Job
        </button>
      </div>

      {/* Filters panel */}
      <div className="mb-6 rounded-xl border border-border bg-surface p-4">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex w-full items-center gap-2 text-sm font-medium text-text-primary"
        >
          {filtersOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          Filters
        </button>

        {filtersOpen && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs text-text-tertiary">Position</label>
                <input
                  value={positionInput}
                  onChange={(e) => setPositionInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  placeholder="Position"
                  className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary hover:border-border-hover focus:border-border-hover"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-text-tertiary">Company</label>
                <input
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  placeholder="Company"
                  className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary hover:border-border-hover focus:border-border-hover"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-text-tertiary">Location Type</label>
                <div className="flex flex-wrap items-center gap-2">
                  {LOCATION_TYPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = locationTypes.has(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleLocationType(opt.value)}
                        aria-pressed={active}
                        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                          active
                            ? "border-accent bg-accent-soft text-accent"
                            : "border-border bg-bg text-text-secondary hover:border-border-hover hover:text-text-primary"
                        }`}
                      >
                        <Icon size={13} />
                        {LOCATION_LABEL[opt.value]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={runSearch}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-text-primary py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-accent hover:text-white"
            >
              <SearchIcon size={14} />
              Search Jobs
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {error ? (
        <ErrorState message={error} onRetry={() => setRetryToken((t) => t + 1)} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-text-tertiary">{jobs.length} jobs</p>

          {jobs.length === 0 ? (
            <p className="py-10 text-center text-sm text-text-secondary">
              No jobs match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-hover"
                >
                  <div className="mb-3 flex items-start gap-2.5">
                    <JobLogo text={job.logoText} color={job.logoColor} />
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-text-primary">{job.title}</h3>
                      <p className="truncate text-xs text-text-secondary">{job.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
                    <span className="inline-flex items-center gap-1.5">
                      <LocationIcon type={job.locationType} />
                      {LOCATION_LABEL[job.locationType]}
                      {job.location && ` (${job.location})`}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <DollarSign size={11} className="text-text-tertiary" />
                      {formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
                    <span className="rounded-md bg-surface-active px-2 py-1 text-[11px] font-medium text-text-primary/80">
                      {EMPLOYMENT_LABEL[job.employmentType]}
                    </span>
                    <span className="text-[11px] text-text-tertiary">
                      {formatPostedAgo(job.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
