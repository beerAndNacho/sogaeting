import { fallbackPostDateReply } from "../../../lib/fallback";

export async function POST(req) {
  const payload = await req.json();
  const apiUrl = process.env.LLM_API_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;

  if (!apiUrl || !apiKey || !model) {
    return Response.json({ reply: fallbackPostDateReply(payload), mode: "demo" });
  }

  const system = `당신은 방금 소개팅을 마친 상대방입니다. 이제 메신저로 짧게 대화합니다.
소개팅 당시 케미 점수: ${payload.chemistry}
사용자의 연습 목표: ${payload.goal}
규칙:
- 실제 카카오톡처럼 한 번에 1~2개의 짧은 메시지 느낌으로 답합니다.
- 케미가 높으면 따뜻하고 다음 만남에 열려 있으며, 낮으면 예의를 지키되 거리를 둡니다.
- 사용자가 무리하게 약속을 강요하면 부드럽게 경계를 표현합니다.
- 연락처, 주소 등 개인정보를 요구하지 않습니다.
- 분석이나 코칭을 하지 말고 상대 역할만 합니다.`;

  try {
    const r = await fetch(apiUrl, {
      method:"POST",
      headers:{"Content-Type":"application/json",Authorization:`Bearer ${apiKey}`},
      body:JSON.stringify({model,messages:[{role:"system",content:system},...payload.messages.map(m=>({role:m.role,content:m.content}))],temperature:0.85})
    });
    if (!r.ok) throw new Error("llm");
    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || data?.output_text || data?.content?.[0]?.text;
    if (!reply) throw new Error("empty");
    return Response.json({reply,mode:"live"});
  } catch {
    return Response.json({reply:fallbackPostDateReply(payload),mode:"demo-fallback"});
  }
}
