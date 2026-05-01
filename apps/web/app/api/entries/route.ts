import { upsertEntry } from "@/lib/store";

export async function POST(request: Request) {
  const entry = await request.json();
  const saved = await upsertEntry(entry);
  return Response.json({ ok: true, entry: saved });
}
