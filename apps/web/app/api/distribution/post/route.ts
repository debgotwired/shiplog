export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return Response.json({ ok: true, mode: "mock", delivered: ["slack", "webhook"], body });
}
