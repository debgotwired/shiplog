import type { MetadataRoute } from "next";
import { getPublicEntriesForProject, getState } from "@/lib/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const state = await getState();
  const projectEntries = await Promise.all(state.projects.map(async (project) => ({
    project,
    entries: await getPublicEntriesForProject(project.id)
  })));
  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/demo-widget`, lastModified: new Date() },
    ...projectEntries.flatMap(({ project, entries }) => [
      { url: `${baseUrl}/changelog/${project.slug}`, lastModified: new Date() },
      ...entries.map((entry) => ({ url: `${baseUrl}/changelog/${project.slug}#${entry.slug}`, lastModified: new Date(entry.updatedAt) }))
    ])
  ];
}
