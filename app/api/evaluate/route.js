import { fallbackEvaluation } from "../../../lib/fallback";

export async function POST(req) {
  const payload = await req.json();
  return Response.json(fallbackEvaluation(payload.messages || []));
}
