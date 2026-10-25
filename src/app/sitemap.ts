import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { people } from "@/content/people";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const pages = ["", "/film", "/casting", "/casting/apply", "/questions", "/stories", "/about", "/press", "/privacy"];
  return [
    ...pages.map((p) => ({
      url: `${base}${p}`,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : p.startsWith("/casting") ? 0.9 : 0.7,
    })),
    // Only published (approved) participant stories are listed.
    ...people
      .filter((p) => !p.placeholder)
      .map((p) => ({ url: `${base}/stories/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
