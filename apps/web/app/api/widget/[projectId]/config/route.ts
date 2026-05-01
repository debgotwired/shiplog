import { demoEntries, demoProject } from "@/lib/demo-data";

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const entries = demoEntries.filter((entry) => entry.projectId === projectId && entry.status === "published");
  return Response.json({ project: demoProject, entries, segments: { admins: true }, frequencyCap: { oncePerSession: true, maxPerWeek: 2 }, demo: true });
}
