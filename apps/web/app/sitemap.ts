import type { MetadataRoute } from "next";
import { demoProject, getPublicEntries } from "@/lib/demo-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/demo-widget`, lastModified: new Date() },
    { url: `${baseUrl}/changelog/${demoProject.slug}`, lastModified: new Date() },
    ...getPublicEntries().map((entry) => ({ url: `${baseUrl}/changelog/${demoProject.slug}#${entry.slug}`, lastModified: new Date(entry.updatedAt) }))
  ];
}
