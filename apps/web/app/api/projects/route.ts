import { createProject } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const project = await createProject({ name: String(body.name ?? "Untitled project"), orgId: body.orgId });
  return Response.json({ ok: true, project });
}
