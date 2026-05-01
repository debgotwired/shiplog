import { getPublicEntries } from "@/lib/demo-data";
import { rss } from "@/lib/feed";

export async function GET(_request: Request, { params }: { params: Promise<{ projectSlug: string }> }) {
  const { projectSlug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new Response(rss(projectSlug, getPublicEntries(), baseUrl), { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
