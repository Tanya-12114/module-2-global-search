"use client";

import { useMemo, useState } from "react";
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

// ---------------------------------------------------------------------------
// Self-contained mock dataset. Job postings aren't a real entity type in the
// search module yet (see src/types/entities.ts) — this generates a large,
// deterministic set of listings client-side so the board has enough rows to
// scroll through. Swap `buildJobs()` for a real fetch once a `job` entity
// type + API endpoint exist.
// ---------------------------------------------------------------------------

type LocationType = "On-site" | "Hybrid" | "Remote";
type EmploymentType = "Full-time" | "Part-time" | "Contract";

interface Job {
  id: string;
  title: string;
  company: string;
  logoText: string;
  logoColor: string;
  locationType: LocationType;
  location: string; // empty for Remote
  salaryMin: number;
  salaryMax: number;
  employmentType: EmploymentType;
  postedMinutesAgo: number;
}

const COMPANIES: { name: string; logoText: string; logoColor: string }[] = [
  { name: "Twitch", logoText: "🎮", logoColor: "#6441A5" },
  { name: "The Nuclear Company", logoText: "N", logoColor: "#111827" },
  { name: "Edison Scientific", logoText: "✕", logoColor: "#374151" },
  { name: "McMee", logoText: "M", logoColor: "#DC2626" },
  { name: "Quantcast", logoText: "Q", logoColor: "#14B8A6" },
  { name: "MD Education", logoText: "MD", logoColor: "#DB2777" },
  { name: "MailerLite", logoText: "lite", logoColor: "#22C55E" },
  { name: "Ofgem", logoText: "ofgem", logoColor: "#F59E0B" },
  { name: "CARMA", logoText: "▦", logoColor: "#2563EB" },
  { name: "Future", logoText: "F", logoColor: "#0F172A" },
  { name: "Reddit", logoText: "👽", logoColor: "#FF4500" },
  { name: "Synechron", logoText: "S", logoColor: "#6B7280" },
  { name: "Xylem", logoText: "xylem", logoColor: "#1D4ED8" },
  { name: "Handshake", logoText: "H", logoColor: "#A3E635" },
  { name: "Roger Healthcare", logoText: "Roger", logoColor: "#F5F5F5" },
  { name: "Human Made Machine", logoText: "HMM", logoColor: "#78716C" },
  { name: "Northwind AI", logoText: "N", logoColor: "#3B82F6" },
  { name: "Basalt Labs", logoText: "B", logoColor: "#0EA5E9" },
  { name: "Meridian Systems", logoText: "M", logoColor: "#8B5CF6" },
  { name: "Cobalt Intelligence", logoText: "C", logoColor: "#0891B2" },
  { name: "Fernweh AI", logoText: "F", logoColor: "#DB2777" },
  { name: "Arclight Technologies", logoText: "A", logoColor: "#EA580C" },
  { name: "Solace Labs", logoText: "S", logoColor: "#059669" },
  { name: "Driftwood AI", logoText: "D", logoColor: "#65A30D" },
  { name: "Ironclad Systems", logoText: "I", logoColor: "#475569" },
  { name: "Halcyon AI", logoText: "H", logoColor: "#CA8A04" },
];

const TITLES = [
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
  "Data Scientist",
  "Director, AI Strategist",
  "Machine Learning Engineer I",
  "AI Engineer",
  "Junior Market Research Analyst",
  "Research Scientist",
  "Prompt Engineer",
  "MLOps Engineer",
  "Computer Vision Engineer",
  "NLP Engineer",
  "AI Product Manager",
  "AI Ethics Researcher",
  "Founding AI Engineer",
  "Staff Machine Learning Engineer",
  "AI Solutions Architect",
];

const CITIES = [
  "San Francisco, CA, United States",
  "Washington, DC, United States",
  "Boston, MA, United States",
  "Frisco, TX, United States",
  "Vienna, Austria",
  "London, United Kingdom",
  "Pittsburgh, PA, United States",
  "Charlotte, NC, United States",
  "New York, NY, United States",
  "Seattle, WA, United States",
  "Austin, TX, United States",
  "Toronto, Canada",
  "Berlin, Germany",
  "Singapore",
  "Bengaluru, India",
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

function buildJobs(count: number): Job[] {
  const rand = seededRandom(7);
  const jobs: Job[] = [];

  for (let i = 0; i < count; i++) {
    const company = pick(COMPANIES, rand);
    const title = pick(TITLES, rand);
    const locationType = pick<LocationType>(["On-site", "Hybrid", "Remote"], rand);
    const employmentType = pick<EmploymentType>(
      ["Full-time", "Full-time", "Full-time", "Part-time", "Contract"],
      rand
    );
    const base = 60_000 + Math.floor(rand() * 180_000);
    const salaryMin = Math.round(base / 1000) * 1000;
    const salaryMax = salaryMin + 20_000 + Math.floor(rand() * 120_000);
    const postedMinutesAgo =
      rand() > 0.9 ? Math.floor(rand() * 60) : Math.floor(rand() * 60 * 24 * 30);

    jobs.push({
      id: `job-${i + 1}`,
      title,
      company: company.name,
      logoText: company.logoText,
      logoColor: company.logoColor,
      locationType,
      location: locationType === "Remote" ? "" : pick(CITIES, rand),
      salaryMin,
      salaryMax,
      employmentType,
      postedMinutesAgo,
    });
  }

  return jobs;
}

const ALL_JOBS = buildJobs(56);

function formatPostedAgo(minutes: number): string {
  if (minutes < 60) return minutes <= 1 ? "1 minute ago" : `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

function formatSalary(n: number): string {
  return `$${n.toLocaleString()}`;
}

function LocationIcon({ type }: { type: LocationType }) {
  if (type === "On-site") return <Building2 size={11} className="text-text-tertiary" />;
  if (type === "Hybrid") return <Home size={11} className="text-text-tertiary" />;
  return <Globe2 size={11} className="text-text-tertiary" />;
}

function JobLogo({ text, color }: { text: string; color: string }) {
  const isEmoji = /\p{Emoji}/u.test(text) && text.length <= 2;
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold uppercase text-white"
      style={{ backgroundColor: color }}
    >
      {isEmoji ? <span className="text-base leading-none">{text}</span> : text.slice(0, 2)}
    </div>
  );
}

const LOCATION_TYPE_OPTIONS: { value: LocationType; icon: typeof Building2 }[] = [
  { value: "On-site", icon: Building2 },
  { value: "Hybrid", icon: Home },
  { value: "Remote", icon: Globe2 },
];

export function JobBoard() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [positionInput, setPositionInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [locationTypes, setLocationTypes] = useState<Set<LocationType>>(new Set());
  const [appliedPosition, setAppliedPosition] = useState("");
  const [appliedCompany, setAppliedCompany] = useState("");

  function toggleLocationType(value: LocationType) {
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

  const filtered = useMemo(() => {
    return ALL_JOBS.filter((job) => {
      if (
        appliedPosition.trim() &&
        !job.title.toLowerCase().includes(appliedPosition.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        appliedCompany.trim() &&
        !job.company.toLowerCase().includes(appliedCompany.trim().toLowerCase())
      ) {
        return false;
      }
      if (locationTypes.size > 0 && !locationTypes.has(job.locationType)) {
        return false;
      }
      return true;
    });
  }, [appliedPosition, appliedCompany, locationTypes]);

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Job Listings</h1>
        <button
          type="button"
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
                        {opt.value}
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
      <p className="mb-3 text-xs text-text-tertiary">{filtered.length} jobs</p>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-secondary">
          No jobs match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((job) => (
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
                  {job.locationType}
                  {job.location && ` (${job.location})`}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <DollarSign size={11} className="text-text-tertiary" />
                  {formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
                <span className="rounded-md bg-surface-active px-2 py-1 text-[11px] font-medium text-text-primary/80">
                  {job.employmentType}
                </span>
                <span className="text-[11px] text-text-tertiary">
                  {formatPostedAgo(job.postedMinutesAgo)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}