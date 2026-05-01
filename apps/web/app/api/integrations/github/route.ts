export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const pull = payload.pull_request ?? payload;
  return Response.json({ ok: true, provider: "github", publish: false, draft: { title: pull.title ?? "Merged PR: adoption analytics", summary: "Generated from a merged GitHub PR in demo mode.", content: "## What changed\n\nShiplog converted PR metadata into a changelog draft.\n\n## Review\n\nA human must edit and publish this entry.", sourceMetadata: { github: pull } } });
}
