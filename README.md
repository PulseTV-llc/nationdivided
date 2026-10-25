# Nation Divided — website

The website for **Nation Divided**, an independent feature documentary by StockHouse Films.
Built with Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS v4,
GSAP + ScrollTrigger, Lenis, Motion, React Hook Form + Zod, Drizzle ORM + PostgreSQL, and
S3-compatible private storage.

## What's here

| Route | What it is |
| --- | --- |
| `/` | Intro slate, WebGL "horizon" hero, scroll-scrubbed prologue, **The Divide** split-screen sequence, five-chapter *Beyond the Ballot*, contact sheet, questions teaser, horizontal timeline, casting call |
| `/casting` | Casting landing page: approach, what's involved, eligibility, process, privacy, FAQ |
| `/casting/apply` | Five-step application (React Hook Form + Zod), optional direct-to-storage video upload |
| `/casting/thank-you` | Confirmation with application reference |
| `/admin/casting` | Staff review: search, status filter, full submissions, private video, notes, status, CSV export, delete, retention purge |
| `/stories`, `/stories/[slug]` | Participant pages (placeholders until releases are signed) |
| `/questions` | One-at-a-time reflection experience; private notes stay in the browser |
| `/film` | Coming-soon title card, trailer slot (privacy-enhanced YouTube), credits, subscribe CTA |
| `/about`, `/press`, `/privacy` | Studio, press room with media-inquiry form, privacy notice |

Content lives in `src/content/` (copy, chapters, questions, timeline, people, credits, media).
See **[docs/MEDIA.md](docs/MEDIA.md)** to replace placeholder media.

## Local development

```bash
npm install
cp .env.example .env.local     # then edit
npm run dev
```

Quick start with no external services — in `.env.local`:

```
DATABASE_URL=pglite://.data/pglite
STORAGE_DRIVER=local
APP_SECRET=<48+ random characters>
```

`pglite://` runs an embedded Postgres in the dev server process, migrates itself, and stores data
in `.data/`. It is single-process and not crash-safe: **stop `npm run dev` before running
`admin:create` or `db:migrate`**, and if it ever reports `PGlite failed to initialize`, delete
`.data/pglite` (local test data only). For anything long-lived, point `DATABASE_URL` at a real
Postgres (e.g. a free Neon branch).

Create a staff account:

```bash
npm run admin:create -- --email you@stockhousefilms.com --name "Your Name" --role admin
# prints a generated password once; or set ADMIN_PASSWORD (min 12 chars) beforehand
```

Roles: `admin` (everything) and `reviewer` (read, notes, status — no export/delete/purge).

### Scripts

| Script | |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint / TypeScript |
| `npm run db:generate` | Generate a migration after editing `src/lib/db/schema.ts` |
| `npm run db:migrate` | Apply migrations to `DATABASE_URL` |
| `npm run admin:create` | Create or update a staff account |

## Deploying to Vercel

1. **Database** — create a Postgres database (Vercel Marketplace → Neon, or Supabase). Copy its
   pooled connection string.
2. **Storage (optional, for intro videos)** — create a **private** bucket (Cloudflare R2 or AWS S3)
   and an access key limited to that bucket.
   - CORS: allow `PUT` from `https://your-domain` with header `content-type`.
   - Lifecycle rule: expire objects under `casting/pending/` after 2 days (abandoned uploads).
3. **Email (optional)** — create a Resend API key and verify your sending domain.
4. **Bot protection (optional)** — create a Cloudflare Turnstile widget for your domain.
5. Import the repository in Vercel (framework: Next.js) and set the variables from
   **`.env.example`**. Required: `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `APP_SECRET`.
6. Run migrations once against the production database from your machine:
   ```bash
   DATABASE_URL="postgres://…" npm run db:migrate
   DATABASE_URL="postgres://…" npm run admin:create -- --email … --name "…" --role admin
   ```
7. Deploy. Then submit a test application, sign in at `/admin/login`, review it, and delete it.

The Content-Security-Policy in `next.config.ts` automatically allows your storage origin from
the `S3_*` variables. If you add analytics or other third-party scripts, update the CSP — and
keep them off `/casting/apply`.

## Security & privacy design

- All application input is validated server-side with the same Zod schema the form uses.
- Bot protection: honeypot field, minimum fill time, optional Turnstile, same-origin checks.
- Rate limits (Postgres-backed, salted-hash keys — no raw IPs stored): 5 applications/hour per
  network, 3/day per email, 10 upload URLs/hour, 10 login attempts per 15 min per network and per email.
- Videos upload directly to a private bucket via 15-minute signed URLs, are verified on submit,
  then moved out of the pending area. Staff playback uses 5-minute signed URLs.
- Admin sessions: random 256-bit tokens in HttpOnly, SameSite=Strict cookies; only SHA-256 hashes
  are stored. Every page, action and API route re-checks the session server-side. Views, status
  changes, exports and deletions are written to an audit log (never applicant answers).
- CSV export neutralizes spreadsheet formula injection.
- No analytics or tracking scripts anywhere. Logs never contain applicant answers.
- No automated scoring, political profiling, or ranking of applicants.

## What still needs real-world input

- Real contact addresses (search the project for `.example`), YouTube channel URL
  (`src/content/site.ts`), credits and director's statement (`src/content/studio.ts`).
- Production media and participant releases (see docs/MEDIA.md).
- Legal review of `/privacy` and the consent wording on the application's review step
  (bump `CONSENT_VERSION` in `src/app/api/casting/apply/route.ts` when it changes).
- External services listed above (database, storage, email, Turnstile).
