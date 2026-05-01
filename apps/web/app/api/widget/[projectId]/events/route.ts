import { widgetEventSchema } from "@shiplog/shared";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const payload = await request.json();
  const parsed = widgetEventSchema.safeParse({ ...payload, projectId });
  if (!parsed.success) return Response.json({ error: "Invalid widget event", issues: parsed.error.flatten() }, { status: 400 });
  return Response.json({ ok: true, stored: false, demo: true, event: parsed.data });
}
