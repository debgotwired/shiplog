export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return Response.json({ ok: true, copy: { x: "Shipped: targeted changelog announcements that drive adoption.", linkedin: "We shipped a better way to connect product updates to the users who need them.", slack: "New Shiplog update ready for rollout." }, body });
}
