import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const applicationStatus = pgEnum("application_status", [
  "new",
  "under_review",
  "contacted",
  "interview_scheduled",
  "selected",
  "not_selected",
]);

export const adminRole = pgEnum("admin_role", ["admin", "reviewer"]);

/**
 * Casting applications. Private: only readable through the authenticated
 * admin interface. No IP addresses, device fingerprints, or analytics IDs
 * are stored with an application.
 */
export const castingApplications = pgTable(
  "casting_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(),
    status: applicationStatus("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),

    // Step 1 — About you
    fullName: text("full_name").notNull(),
    preferredName: text("preferred_name"),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    isAdult: boolean("is_adult").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),

    // Step 2 — Your experience
    votedTrump2024: text("voted_trump_2024").notNull(),
    feeling: text("feeling").notNull(),
    feelingDetail: text("feeling_detail"),
    issues: jsonb("issues").$type<string[]>().notNull(),
    issuesOther: text("issues_other"),
    hopedChange: text("hoped_change").notNull(),
    viewsEvolved: text("views_evolved"),

    // Step 3 — Your story
    aboutYou: text("about_you").notNull(),
    normalDay: text("normal_day").notNull(),
    whyDocument: text("why_document").notNull(),
    lifeChanges: text("life_changes"),
    comfortableOnCamera: text("comfortable_on_camera").notNull(),
    openToIntroductions: text("open_to_introductions").notNull(),

    // Step 4 — Optional media (private object storage key, never a public URL)
    videoKey: text("video_key"),
    videoContentType: text("video_content_type"),
    videoSize: bigint("video_size", { mode: "number" }),
    videoFileName: text("video_file_name"),

    // Step 5 — Consent (timestamped)
    consentedAt: timestamp("consented_at", { withTimezone: true }).notNull(),
    consentVersion: text("consent_version").notNull(),

    confirmationEmailSent: boolean("confirmation_email_sent").notNull().default(false),
  },
  (t) => [
    index("casting_status_idx").on(t.status),
    index("casting_created_idx").on(t.createdAt),
    index("casting_email_idx").on(t.email),
  ],
);

export const castingNotes = pgTable(
  "casting_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => castingApplications.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => adminUsers.id, { onDelete: "set null" }),
    authorName: text("author_name").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("casting_notes_app_idx").on(t.applicationId)],
);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: adminRole("role").notNull().default("reviewer"),
  passwordHash: text("password_hash").notNull(),
  disabled: boolean("disabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const adminSessions = pgTable(
  "admin_sessions",
  {
    /** SHA-256 of the session token. The raw token only lives in the cookie. */
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("admin_sessions_user_idx").on(t.userId)],
);

/** Who did what to which application. Never stores applicant answers. */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => adminUsers.id, { onDelete: "set null" }),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(),
    targetId: text("target_id"),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

export const pressInquiries = pgTable("press_inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  name: text("name").notNull(),
  outlet: text("outlet").notNull(),
  email: text("email").notNull(),
  kind: text("kind").notNull(),
  deadline: text("deadline"),
  message: text("message").notNull(),
  handled: boolean("handled").notNull().default(false),
});

/** Fixed-window rate limiting. Keys are salted hashes, never raw IPs. */
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").notNull(),
    windowStart: bigint("window_start", { mode: "number" }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })],
);

export type CastingApplicationRow = typeof castingApplications.$inferSelect;
export type CastingNoteRow = typeof castingNotes.$inferSelect;
export type AdminUserRow = typeof adminUsers.$inferSelect;
