import { getState } from "@/lib/store";

export async function GET() {
  return Response.json({ ok: true, ...(await getState()) });
}
