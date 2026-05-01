import { rss } from "@/lib/feed";
import { getProjectWithPublicEntries } from "@/lib/store";

export async function GET(_request: Request, { params }: { params: Promise<{ projectSlug: string }> }) {
  const { projectSlug } = await params;
  const data = await getProjectWithPublicEntries(projectSlug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new Response(rss(projectSlug, data?.entries ?? [], baseUrl), { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
