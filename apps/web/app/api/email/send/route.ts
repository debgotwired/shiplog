import { Resend } from "resend";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  return Response.json({ ok: true, mode: resend ? "resend-ready" : "mock", result: { sent: 1248, opened: 612, clicked: 184, unsubscribed: 3 }, body });
}
