import { getPublicEntries } from "@/lib/demo-data";
import { atom } from "@/lib/feed";

export async function GET(_request: Request, { params }: { params: Promise<{ projectSlug: string }> }) {
  const { projectSlug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new Response(atom(projectSlug, getPublicEntries(), baseUrl), { headers: { "content-type": "application/atom+xml; charset=utf-8" } });
}
