import { getPublicEntriesForProject, getState } from "@/lib/store";

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const state = await getState();
  const project = state.projects.find((item) => item.id === projectId) ?? state.projects[0];
  const entries = await getPublicEntriesForProject(project.id);
  return Response.json({ project, entries, segments: { admins: true }, frequencyCap: { oncePerSession: true, maxPerWeek: 2 }, demo: process.env.NEXT_PUBLIC_DEMO_MODE !== "false" });
}
