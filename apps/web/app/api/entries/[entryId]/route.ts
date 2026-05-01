import { patchEntry } from "@/lib/store";

export async function PATCH(request: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;
  const patch = await request.json().catch(() => ({}));
  const entry = await patchEntry(entryId, patch);
  return Response.json({ ok: true, entry });
}
