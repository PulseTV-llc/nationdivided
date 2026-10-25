import "server-only";
import { z } from "zod";

/**
 * Server-only environment. Never import this from a Client Component —
 * `server-only` makes that a build error. Only NEXT_PUBLIC_* values are
 * ever sent to the browser.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  /** postgres://… in production. `pglite://./.data/pglite` for local development only. */
  DATABASE_URL: z.string().optional(),

  /** Long random string used to salt rate-limit keys and sign local upload tokens. */
  APP_SECRET: z.string().min(32).optional(),

  // Object storage (any S3-compatible provider: AWS S3, Cloudflare R2, Backblaze B2, MinIO…)
  STORAGE_DRIVER: z.enum(["s3", "local"]).optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.enum(["true", "false"]).optional(),

  // Transactional email (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  CASTING_NOTIFY_EMAIL: z.string().optional(),
  PRESS_NOTIFY_EMAIL: z.string().optional(),

  // Bot protection (Cloudflare Turnstile)
  TURNSTILE_SECRET_KEY: z.string().optional(),

  /** Days to keep "Not Selected" applications before they can be purged. */
  CASTING_RETENTION_DAYS: z.coerce.number().int().positive().default(365),

  /** Set to "true" behind a trusted proxy that sets X-Forwarded-For (Vercel does). */
  TRUST_PROXY: z.enum(["true", "false"]).optional(),
});

let cached: z.infer<typeof schema> | null = null;

export function env() {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new Error(`Invalid server environment: ${issues}`);
    }
    cached = parsed.data;
  }
  return cached;
}

export const isProd = () => env().NODE_ENV === "production";

export function appSecret(): string {
  const s = env().APP_SECRET;
  if (s) return s;
  if (isProd()) throw new Error("APP_SECRET must be set in production.");
  return "development-only-insecure-secret-change-me-0000";
}
