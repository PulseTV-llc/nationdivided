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
  /** Short caption shown under the frame (falls back to alt). */
  caption?: string;
  /**
   * True for illustrative stand-in images (not footage from the film).
   * Informational only: kept so they can be found and replaced once real
   * production stills are approved.
   */
  illustrative?: boolean;
};

const still = (file: string, caption: string, alt: string): ImageAsset => ({
  src: `/media/stills/${file}.jpg`,
  width: 1672,
  height: 941,
  caption,
  alt,
  illustrative: true,
});

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

const chapterStill = (file: string, alt: string): ImageAsset => ({
  src: `/media/chapters/${file}.jpg`,
  width: 1086,
  height: 1448,
  alt,
  illustrative: true,
});

export const media = {
  /** Homepage hero. 10–20s seamless loop, 1920×1080, ≤ 6 MB. */
  heroVideo: null as VideoAsset | null,

  /** Official one-sheet. 2:3 portrait, 2000×3000. */
  poster: {
    src: "/media/poster/nation-divided-poster.jpg",
    alt: "Nation Divided official poster: six Americans of different ages and backgrounds beneath a sky split between sunset and night, a road running toward a seam of light. Tagline: Every vote has a story.",
    width: 1024,
    height: 1536,
  } as ImageAsset | null,

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
  interviewStills: [
    still("detroit-dusk", "Main Street, Detroit", "Detroit skyline at dusk, headlights streaming along a wet freeway"),
    still("kitchen-table", "Kitchen table", "A steaming mug and an open notebook on a kitchen table in warm morning light"),
    still("water-tower-road", "County road", "A small-town water tower silhouetted against a twilight sky"),
    still("midnight-diner", "Night shift", "An empty diner counter under pendant lights on a rainy night"),
    still("polling-place", "Polling place", "Voters lining up at the lit entrance of a polling place at night"),
    still("rally", "Rally", "A crowd facing a speaker at a podium in front of a large American flag"),
    still("rural-highway", "The drive home", "A moonlit rural highway leading past a farm with a lit barn"),
    still("interview-studio", "Interview setup", "An empty leather chair under studio lights, camera and boom microphone ready"),
  ] as ImageAsset[],

  /** "Beyond the Ballot" chapter frames, keyed by chapter id (4:5 portrait). */
  chapterImages: {
    "the-vote": chapterStill("the-vote", "An audience in a dark hall looking up toward stage lights"),
    "the-expectation": chapterStill("the-expectation", "A straight two-lane highway running toward a setting sun"),
    "the-reality": chapterStill("the-reality", "A steaming mug on a kitchen table by a window at dusk"),
    "the-consequences": chapterStill("the-consequences", "An empty diner counter with red stools under pendant lights at night"),
    "the-conversation": chapterStill("the-conversation", "A front door left open onto a warmly lit hallway at night"),
  } as Record<string, ImageAsset | null>,

  /** Casting page — "A day in your life" (4:5 portrait). */
  castingDayInLife: {
    src: "/media/casting/day-in-your-life.jpg",
    alt: "A woman sitting on the edge of her bed tying her running shoes in warm morning light, a coffee cup on the nightstand and a dog resting on the rug",
    width: 1122,
    height: 1402,
    illustrative: true,
  } as ImageAsset | null,

  /** Behind-the-scenes production stills. */
  behindTheScenes: [
    still("water-tower-road", "County road", "A small-town water tower silhouetted against a twilight sky"),
    still("midnight-diner", "Night shift", "An empty diner counter under pendant lights on a rainy night"),
    still("detroit-dusk", "Detroit", "Detroit skyline at dusk, headlights streaming along a wet freeway"),
  ] as ImageAsset[],

  /** /film title card background. */
  filmHero: still("rural-highway", "The drive home", "A moonlit rural highway leading past a farm with a lit barn") as ImageAsset | null,

  /** /film trailer panel shown until the trailer exists. */
  trailerStandby: still("interview-studio", "Interview setup", "An empty leather chair under studio lights, camera and boom microphone ready") as ImageAsset | null,

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
  { scene: "crowd", caption: "Rally" },
  { scene: "road", caption: "The drive home" },
  { scene: "portrait", caption: "Interview setup" },
];
