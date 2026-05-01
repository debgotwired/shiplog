export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const issue = payload.data ?? payload.issue ?? payload;
  return Response.json({ ok: true, provider: "linear", publish: false, draft: { title: issue.title ?? "Completed issue: targeting builder", summary: "Generated from a completed Linear issue in demo mode.", content: "## What changed\n\nShiplog converted Linear metadata into a changelog draft for review.", sourceMetadata: { linear: issue } } });
}
