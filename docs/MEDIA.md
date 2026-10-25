# Replacing placeholder media

Every image and video slot is registered in **`src/content/media.ts`** (site-wide media) and
**`src/content/people.ts`** (participant portraits). When a slot is `null` or empty, the site
shows an original generative placeholder labelled "Placeholder". Nothing on the site is stock
or news footage.

> Only use material StockHouse Films owns or has licensed for this use. Do not add news clips or
> stock footage and present them as documentary material. Archival clips need a documented source
> and license (the `archivalClips` type requires both fields).

## Slots

| Slot | Where it appears | Format |
| --- | --- | --- |
| `heroVideo` | Homepage hero (replaces the WebGL "horizon") | 1920×1080 H.264 MP4 (+ optional WebM), 10–20 s seamless loop, **no audio track**, ≤ 6 MB, plus a JPG `poster` |
| `poster` | Film key art | 2000×3000 JPG/WebP |
| `studioLogo` | About page | SVG preferred |
| `socialCard` | Optional override of the generated Open Graph image | 1200×630 |
| `trailerYouTubeId` | /film trailer (privacy-enhanced embed, loads on click) | YouTube video ID |
| `filmYouTubeId` | /film full documentary | YouTube video ID |
| `interviewStills` | Homepage contact sheet | 6–12 images, 3:2, ≥ 1600 px wide |
| `behindTheScenes` | /film "From the road" | 4:5 portrait, ≥ 1200 px |
| `pressStills` | /press approved imagery (downloadable) | High-res JPG |
| `pressKit` | /press download | PDF or ZIP `{ href, label, size }` |
| `people[].portrait` | /stories and story pages | 4:5 portrait, ≥ 1600 px tall |
| `people[].excerptYouTubeId` | Story page excerpt | YouTube video ID |

## Steps

1. Put files in `public/media/…` (e.g. `public/media/hero/loop.mp4`).
2. Fill in the slot, e.g.

   ```ts
   heroVideo: {
     src: "/media/hero/loop.mp4",
     srcWebm: "/media/hero/loop.webm",
     poster: "/media/hero/poster.jpg",
     alt: "Dawn over a county road outside Dayton, Ohio",
   },
   ```

3. Always write a real description in `alt`.
4. For images hosted elsewhere, add the host to `images.remotePatterns` in `next.config.ts` and
   to `img-src` in the Content-Security-Policy there.

## Participants

Each entry in `src/content/people.ts` starts as `placeholder: true`. Only replace one after the
participant has signed a release covering their name, image, location and words. Quotes must be
transcribed from recordings. Set `placeholder: false` to include the page in the sitemap and in
search results.

## Timeline

`src/content/timeline.ts`: every `kind: "fact"` entry must have at least one source — the build
fails otherwise. Production milestones use `kind: "production"`.
