/**
 * ─────────────────────────────────────────────────────────────
 *  CENTRAL MEDIA REGISTRY
 * ─────────────────────────────────────────────────────────────
 *
 * Every image and video slot on the site reads from this file.
 * Until cleared production media exists, each slot is `null` and the
 * site renders an original, clearly labelled generative placeholder.
 *
 * TO REPLACE A PLACEHOLDER
 *   1. Put the file in /public/media/... (or use a full https URL from a
 *      host you have rights to, and add that host to next.config images).
 *   2. Set `src` (and `poster` for video) below.
 *   3. Write a real description in `alt`.
 *
 * Only use footage StockHouse Films owns or has licensed. Do not drop in
 * news footage or stock clips and present them as documentary material.
 * See docs/MEDIA.md for formats and sizes.
 */

export type ImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  credit?: string;
};

export type VideoAsset = {
  /** Muted, looping background clip — H.264 MP4 and/or WebM. */
  src: string;
  srcWebm?: string;
  /** Still frame shown before the video loads and on reduced-motion. */
  poster: string;
  alt: string;
};

export type PlaceholderScene =
  | "street"
  | "field"
  | "porch"
  | "diner"
  | "portrait"
  | "crowd"
  | "road"
  | "kitchen"
  | "flag"
  | "studio";

export const media = {
  /** Homepage hero. 10–20s seamless loop, 1920×1080, ≤ 6 MB. */
  heroVideo: null as VideoAsset | null,

  /** Official one-sheet. 2:3 portrait, 2000×3000. */
  poster: null as ImageAsset | null,

  /**
   * Official StockHouse Films logo. Black on transparent; the site renders it
   * as a mask so it can be shown in ivory or gold on dark backgrounds.
   */
  studioLogo: {
    src: "/media/brand/stockhouse-logo.png",
    alt: "StockHouse Films",
    width: 1226,
    height: 700,
  } as ImageAsset | null,

  /** Social share image override. 1200×630. Generated automatically when null. */
  socialCard: null as ImageAsset | null,

  /** Official trailer — YouTube video ID (e.g. "dQw4w9WgXcQ"). */
  trailerYouTubeId: null as string | null,

  /** Full film YouTube video ID, once released. */
  filmYouTubeId: null as string | null,

  /** Interview stills used on the homepage contact sheet (6–12 frames). */
  interviewStills: [] as ImageAsset[],

  /** Behind-the-scenes production stills. */
  behindTheScenes: [] as ImageAsset[],

  /** Campaign-era archival clips. Only add material with documented clearance. */
  archivalClips: [] as (VideoAsset & { source: string; license: string })[],

  /** Approved press stills for /press. */
  pressStills: [] as ImageAsset[],

  /** Downloadable press kit (PDF/ZIP) — leave null until available. */
  pressKit: null as { href: string; label: string; size: string } | null,
};

/** Scenes used for generative placeholder frames on the contact sheet. */
export const placeholderContactSheet: { scene: PlaceholderScene; caption: string }[] = [
  { scene: "street", caption: "Main street, dusk" },
  { scene: "kitchen", caption: "Kitchen table" },
  { scene: "field", caption: "County road" },
  { scene: "diner", caption: "Morning shift" },
  { scene: "porch", caption: "Front porch" },
  { scene: "crowd", caption: "Rally, 2024" },
  { scene: "road", caption: "The drive home" },
  { scene: "portrait", caption: "Interview setup" },
];
