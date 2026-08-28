import { fallbackReply } from "../../../lib/fallback";

export async function POST(req) {
  const payload = await req.json();
  const apiUrl = process.env.LLM_API_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;

  if (!apiUrl || !apiKey || !model) {
    return Response.json({ reply: fallbackReply(payload), mode: "demo" });
  }

  const system = `당신은 한국의 소개팅 예행연습 상대입니다. 실제 소개팅처럼 자연스럽게 대화하세요.\n역할: ${payload.persona}\n장소: ${payload.place}\n난이도: ${payload.difficulty}\n규칙: 한 번에 1~3문장, 사용자의 말에 먼저 반응, 상담사처럼 분석하지 말고 소개팅 상대 역할만 수행, 개인정보 요구 금지, 난이도가 높으면 짧은 답변·반문·약간의 어색함을 섞기.`;

  try {
    const r = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: system }, ...payload.messages.map(m => ({ role: m.role, content: m.content }))],
        temperature: 0.9,
      }),
    });
    if (!r.ok) throw new Error(`LLM ${r.status}`);
    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || data?.output_text || data?.content?.[0]?.text;
    if (!reply) throw new Error("No reply");
    return Response.json({ reply, mode: "live" });
  } catch {
    return Response.json({ reply: fallbackReply(payload), mode: "demo-fallback" });
  }
}
