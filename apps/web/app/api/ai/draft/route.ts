import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
  return Response.json({ ok: true, mode: client ? "anthropic-ready" : "mock", variants: { product: "A user-facing update focused on the benefit.", technical: "A technical summary with implementation notes.", short: "Short social/email summary." }, input: body });
}
