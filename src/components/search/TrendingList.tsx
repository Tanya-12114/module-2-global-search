"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Star,
  BadgeCheck,
  ExternalLink,
  Play,
  TrendingUp,
} from "lucide-react";
import { SearchEntity } from "@/types/entities";
import { ENTITY_META } from "@/lib/entityMeta";
import { Badge } from "@/components/ui/Badge";

/**
 * Deterministic pseudo-signals derived from popularityScore + id, standing
 * in for fields the real API will eventually provide directly (upvotes,
 * rating, verified badge, whether the listing has a media preview). Same
 * entity always produces the same numbers, so the layout doesn't jitter
 * between renders.
 */
function seededInt(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

type MediaVariant = "none" | "video" | "banner";

// Real, freely-embeddable sample assets, standing in for whatever media URL
// the real API will eventually return per listing. Videos are Google's
// public sample-video bucket (the same clips used across countless <video>
// tag demos); images are real photos from picsum.photos, seeded per entity
// so the same listing always gets the same photo.
const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
];

function deriveTrendingSignals(entity: SearchEntity) {
  const upvotes = Math.round(entity.popularityScore / 15) + seededInt(`${entity.id}-up`, 0, 40);
  const downvotes = seededInt(`${entity.id}-down`, 0, 18);
  const comments = seededInt(`${entity.id}-c`, 0, 60);
  const rating = (3.4 + (seededInt(`${entity.id}-r`, 0, 16) / 10)).toFixed(1);
  const verified = seededInt(`${entity.id}-v`, 0, 10) > 6;
  const mediaRoll = seededInt(`${entity.id}-m`, 0, 10);
  const mediaVariant: MediaVariant = mediaRoll > 7 ? "video" : mediaRoll > 4 ? "banner" : "none";
  const videoUrl = SAMPLE_VIDEOS[seededInt(`${entity.id}-vid`, 0, SAMPLE_VIDEOS.length - 1)];
  const photoUrl = `https://picsum.photos/seed/${entity.id}/480/320`;
  const daysAgo = Math.max(1, Math.round((Date.now() - new Date(entity.createdAt).getTime()) / 86_400_000));
  return { upvotes, downvotes, comments, rating, verified, mediaVariant, videoUrl, photoUrl, daysAgo };
}

function EntityLogo({ entity, size = 40 }: { entity: SearchEntity; size?: number }) {
  const meta = ENTITY_META[entity.type];
  const Icon = meta.icon;

  if (entity.imageUrl) {
    return (
      <Image
        src={entity.imageUrl}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-lg object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: meta.solidColor, width: size, height: size }}
      aria-hidden
    >
      <Icon size={size * 0.45} className="text-white" strokeWidth={2} />
    </div>
  );
}

/** Real sample video, muted-preview-on-hover + click-to-play-with-sound — same interaction TAAFT's own cards use. */
function VideoPreview({ src, poster, title }: { src: string; poster: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function startPreview() {
    const el = videoRef.current;
    if (!el || playing) return;
    el.play().catch(() => {});
  }

  function stopPreview() {
    const el = videoRef.current;
    if (!el || playing) return;
    el.pause();
    el.currentTime = 0;
  }

  function handlePlayClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.controls = true;
    el.play().catch(() => {});
    setPlaying(true);
  }

  return (
    <div
      className="relative mt-3 h-28 w-full shrink-0 overflow-hidden rounded-lg bg-black sm:h-24 sm:w-44"
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        className="h-full w-full object-cover"
        aria-label={`${title} preview video`}
      />
      {!playing && (
        <button
          onClick={handlePlayClick}
          aria-label={`Play ${title} preview`}
          className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors hover:bg-black/25"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
            <Play size={16} className="ml-0.5 fill-white text-white" />
          </span>
        </button>
      )}
    </div>
  );
}

function BannerPreview({ src, title }: { src: string; title: string }) {
  return (
    <div className="relative mt-3 h-28 w-full shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-44">
      <Image src={src} alt={`${title} preview`} fill sizes="176px" className="object-cover" />
    </div>
  );
}

interface TrendingListProps {
  items: SearchEntity[];
  startRank: number;
  /** e.g. "Trending" — used in the "#N in Trending" line, matching TAAFT. */
  sectionLabel: string;
}

export function TrendingList({ items, startRank, sectionLabel }: TrendingListProps) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((entity, index) => {
        const rank = startRank + index;
        const meta = ENTITY_META[entity.type];
        const href = `${meta.basePath}/${entity.slug}`;
        const {
          upvotes,
          downvotes,
          comments,
          rating,
          verified,
          mediaVariant,
          videoUrl,
          photoUrl,
          daysAgo,
        } = deriveTrendingSignals(entity);

        return (
          <div
            key={entity.id}
            className="group rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-hover"
          >
            <div className="flex gap-3 sm:gap-4">
              <div className="flex w-6 shrink-0 justify-end pt-1 text-sm tabular-nums text-text-tertiary">
                {rank}
              </div>

              <EntityLogo entity={entity} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <Link href={href} className="flex min-w-0 items-center gap-1.5">
                    <h3 className="truncate text-[15px] font-semibold text-text-primary group-hover:text-accent">
                      {entity.title}
                    </h3>
                    {verified && (
                      <BadgeCheck size={15} className="shrink-0 text-accent" aria-label="Verified" />
                    )}
                    <ExternalLink
                      size={12}
                      className="shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </Link>

                  {/* Vote / comment / rating cluster — top right on wide screens */}
                  <div className="hidden shrink-0 items-center gap-4 text-sm text-text-secondary sm:flex">
                    <span className="inline-flex items-center gap-1">
                      <ArrowUp size={13} className="text-emerald-400" />
                      {upvotes}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ArrowDown size={13} className="text-text-tertiary" />
                      {downvotes}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare size={13} className="text-text-tertiary" />
                      {comments}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      {rating}
                    </span>
                  </div>
                </div>

                <p className="mt-1 line-clamp-1 text-sm text-text-secondary">{entity.description}</p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge>{entity.category}</Badge>
                  {entity.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>

                {mediaVariant === "video" && (
                  <VideoPreview src={videoUrl} poster={photoUrl} title={entity.title} />
                )}
                {mediaVariant === "banner" && <BannerPreview src={photoUrl} title={entity.title} />}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-2.5">
                  <div className="flex items-center gap-3 text-xs text-text-tertiary">
                    <span>{entity.country}</span>
                    <span>Released {daysAgo}d ago</span>
                    <span className="inline-flex items-center gap-1 text-accent">
                      <TrendingUp size={11} />#{rank} in {sectionLabel}
                    </span>
                  </div>

                  {/* Same vote/comment/rating cluster, shown on mobile below the fold line */}
                  <div className="flex items-center gap-4 text-sm text-text-secondary sm:hidden">
                    <span className="inline-flex items-center gap-1">
                      <ArrowUp size={13} className="text-emerald-400" />
                      {upvotes}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ArrowDown size={13} className="text-text-tertiary" />
                      {downvotes}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare size={13} className="text-text-tertiary" />
                      {comments}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      {rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
