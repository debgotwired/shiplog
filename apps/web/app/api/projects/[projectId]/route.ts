import { updateProject } from "@/lib/store";

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const patch = await request.json().catch(() => ({}));
  const project = await updateProject(projectId, patch);
  return Response.json({ ok: true, project });
}
