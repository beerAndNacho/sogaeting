import { fallbackReply } from "../../../lib/fallback";
import { PERSONAS, PLACES, DIFFICULTIES, MISSIONS } from "../../../lib/scenarios";

export async function POST(req) {
  const payload = await req.json();
  const apiUrl = process.env.LLM_API_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;

  if (!apiUrl || !apiKey || !model) {
    return Response.json({ reply: fallbackReply(payload), mode: "demo" });
  }

  const persona = PERSONAS.find(p => p.id === payload.persona) || PERSONAS[0];
  const place = PLACES.find(p => p.id === payload.place) || PLACES[0];
  const difficulty = DIFFICULTIES.find(d => d.id === payload.difficulty) || DIFFICULTIES[1];
  const mission = MISSIONS.find(m => m.id === payload.mission) || MISSIONS[0];
  const turn = payload.messages?.filter(m => m.role === "user").length || 0;

  const system = `
당신은 한국에서 진행되는 소개팅 예행연습의 '소개팅 상대'입니다.
사용자를 코칭하는 AI가 아니라 실제 처음 만난 사람처럼 끝까지 역할극을 유지하세요.

[상대 캐릭터]
성격: ${persona.label}
특징: ${persona.description}
키워드: ${persona.traits.join(", ")}

[현재 상황]
장소: ${place.scene}
난이도: ${difficulty.label} - ${difficulty.hint}
사용자의 연습 미션: ${mission.label} - ${mission.description}
현재 대화 턴: ${turn}

[대화 규칙]
- 한국어 구어체로 1~3문장만 말하세요.
- 실제 소개팅처럼 자연스럽게 반응하고, 매번 질문으로 끝내지 마세요.
- 사용자가 한 말을 구체적으로 받아준 다음 대화를 이어가세요.
- 같은 질문을 반복하지 마세요.
- 심리 분석, 점수, 코칭, 모범답안은 절대 말하지 마세요.
- 이름, 전화번호, 주소, 회사명 등 구체적인 개인정보를 요구하지 마세요.
- 상대 역할에 맞는 취향과 의견을 일관되게 유지하세요.
- 너무 완벽하게 친절하지 마세요. 가끔 짧은 리액션이나 자연스러운 화제 전환도 허용됩니다.
- 난이도가 '고난도'라면 짧은 답, 반문, 약간의 어색함을 섞되 공격적이거나 모욕적으로 행동하지 마세요.
- 사용자가 부담스러운 성적 표현, 위협, 집착성 표현을 하면 선을 긋고 화제를 전환하세요.
- 대화가 6턴 이후이고 미션이 '다음 약속 잡기'라면 사용자가 자연스럽게 제안할 기회를 만들어주세요.
- 대화가 4턴 이후이고 미션이 '호감 표현 연습'이라면 상대도 아주 작은 긍정 신호를 보여줄 수 있습니다.
`;

  try {
    const r = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          ...payload.messages.map(m => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.92,
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
