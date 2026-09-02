import { fallbackReply } from "../../../lib/fallback";

export async function POST(req) {
  const payload = await req.json();
  const apiUrl = process.env.LLM_API_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;

  if (!apiUrl || !apiKey || !model) {
    return Response.json({ reply: fallbackReply(payload), mode: "demo" });
  }

  const stateGuide = {
    spark:"호감도가 높다. 답변이 길고 먼저 질문도 하며 다음 만남을 암시할 수 있다.",
    warm:"편안해지고 있다. 웃음과 개인적인 이야기가 조금씩 늘어난다.",
    neutral:"아직 탐색 중이다. 친절하지만 조심스럽다.",
    cool:"조금 거리감이 있다. 답변이 짧고 먼저 질문하는 빈도가 줄어든다.",
    cold:"어색함이 크다. 공격적이지 않게 대화를 정리하려는 신호를 보인다."
  };

  const system = `당신은 한국의 소개팅 예행연습 상대입니다. 실제 사람처럼 자연스럽게 대화하세요.
캐릭터: ${payload.persona}
장소: ${payload.place}
난이도: ${payload.difficulty}
연습 미션: ${payload.mission}
현재 관계 상태: ${payload.chemistryState || "neutral"}
관계 상태 행동지침: ${stateGuide[payload.chemistryState] || stateGuide.neutral}
현재 돌발상황: ${payload.activeEvent ? `${payload.activeEvent.title} - ${payload.activeEvent.prompt}` : "없음"}
규칙:
- 한 번에 1~3문장만 말합니다.
- 사용자의 말에 먼저 반응하고 필요할 때만 질문합니다.
- 상담사처럼 분석하거나 점수를 말하지 않습니다.
- 현재 호감도 상태에 따라 말의 길이, 질문 빈도, 친밀도를 실제로 바꿉니다.
- 돌발상황이 있으면 그 상황을 자연스럽게 대화에 녹입니다.
- 개인정보, 연락처, 주소 등 민감정보를 요구하지 않습니다.
- 무례하거나 위험한 행동을 조장하지 않습니다.
- 같은 질문을 반복하지 않습니다.`;

  try {
    const r = await fetch(apiUrl, {
      method:"POST",
      headers:{"Content-Type":"application/json",Authorization:`Bearer ${apiKey}`},
      body:JSON.stringify({model,messages:[{role:"system",content:system},...payload.messages.map(m=>({role:m.role,content:m.content}))],temperature:0.9})
    });
    if (!r.ok) throw new Error(`LLM ${r.status}`);
    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || data?.output_text || data?.content?.[0]?.text;
    if (!reply) throw new Error("No reply");
    return Response.json({ reply, mode:"live" });
  } catch {
    return Response.json({ reply:fallbackReply(payload), mode:"demo-fallback" });
  }
}
