const questionPool = {
  cafe: ["쉬는 날에는 보통 뭐 하면서 보내세요?", "요즘 제일 자주 듣는 음악이나 보는 콘텐츠 있어요?", "여행 가면 계획 세우는 편이에요, 즉흥적인 편이에요?", "일 얘기 말고 요즘 가장 재밌는 게 뭐예요?"],
  bar: ["분위기 좋은 곳 자주 찾아다니세요?", "술은 분위기로 마시는 편이에요, 맛으로 마시는 편이에요?", "친구들이 본인을 어떤 사람이라고 많이 말해요?", "사람 볼 때 은근히 중요하게 보는 게 있어요?"],
  restaurant: ["맛집 찾아다니는 거 좋아하세요?", "매운 거 잘 드세요? 저는 메뉴 고를 때 은근 중요하더라고요.", "먹는 것 말고 요즘 빠져 있는 취미 있어요?", "휴가 생기면 국내랑 해외 중 어디가 더 끌려요?"],
  walk: ["걷는 거 좋아하세요? 이런 날씨면 산책하기 괜찮네요.", "혼자 있는 시간도 좋아하는 편이에요?", "요즘 기분 좋아지는 작은 일이 있다면 뭐예요?", "주말 하루가 완전히 비면 어떻게 보내고 싶어요?"],
};

function tonePrefix(persona, difficulty) {
  if (difficulty === "hard") return persona === "quiet" ? "음... " : persona === "direct" ? "근데 " : "";
  return persona === "warm" ? "오, 좋네요 :) " : persona === "playful" ? "ㅋㅋ " : "";
}

export function fallbackReply({ persona, place, difficulty, messages }) {
  const userMessages = messages.filter(m => m.role === "user");
  const last = userMessages.at(-1)?.content || "";
  const pool = questionPool[place] || questionPool.cafe;
  const idx = Math.min(userMessages.length - 1, pool.length - 1);
  const prefix = tonePrefix(persona, difficulty);
  if (userMessages.length === 1) {
    if (last.length < 8) return `${prefix}조금 긴장하신 것 같아요. 괜찮아요. ${pool[0]}`;
    return `${prefix}${last.includes("저") ? "그렇구나. " : ""}${pool[0]}`;
  }
  if (difficulty === "hard" && userMessages.length % 3 === 0) {
    return persona === "direct" ? "음, 그건 좀 의외네요. 그러면 반대로 본인이 소개팅 상대에게 가장 궁금한 건 뭐예요?" : "아 그렇구나. ...그럼 다른 얘기 해볼까요? " + pool[idx];
  }
  if (last.includes("?")) return `${prefix}저는 새로운 곳 가보는 걸 좋아해요. 너무 빡빡한 계획은 싫고요. ${pool[idx]}`;
  return `${prefix}${pool[idx]}`;
}

export function fallbackEvaluation(messages) {
  const users = messages.filter(m => m.role === "user").map(m => m.content);
  const totalChars = users.reduce((a, b) => a + b.length, 0);
  const questions = users.filter(t => t.includes("?") || /어때|세요|나요|뭐|어디|언제|왜/.test(t)).length;
  const empathy = users.filter(t => /그렇|맞아|좋|이해|재밌|궁금|ㅋㅋ|ㅎㅎ/.test(t)).length;
  const warmth = users.filter(t => /좋|반가|재밌|궁금|다음|또|ㅋㅋ|ㅎㅎ/.test(t)).length;
  const clamp = n => Math.max(45, Math.min(96, Math.round(n)));
  const natural = clamp(58 + Math.min(28, totalChars / 18));
  const question = clamp(52 + questions * 9);
  const empathyScore = clamp(55 + empathy * 8);
  const interest = clamp(50 + warmth * 8);
  const overall = Math.round((natural + question + empathyScore + interest) / 4);
  const tips = [];
  if (question < 70) tips.push("상대 답변에서 한 단어를 잡아 짧은 꼬리질문을 해보세요.");
  if (empathyScore < 70) tips.push("질문을 던지기 전에 ‘아 그랬구나’, ‘그거 재밌겠다’ 같은 반응을 한 번 넣어보세요.");
  if (interest < 70) tips.push("호감이 있다면 대화 후반에는 ‘다음에 같이 해보고 싶다’는 작은 신호를 표현해보세요.");
  if (tips.length === 0) tips.push("전반적으로 안정적입니다. 실제 소개팅에서는 상대의 말 속도와 표정을 보며 템포만 조절해보세요.");
  return {
    overall,
    metrics: {
      natural: { label: "자연스러움", score: natural },
      question: { label: "질문력", score: question },
      empathy: { label: "공감", score: empathyScore },
      interest: { label: "호감 표현", score: interest },
    },
    summary: overall >= 82 ? "대화 흐름을 자연스럽게 이어가고 상대에게 관심을 표현하는 힘이 좋았어요." : overall >= 68 ? "전체 흐름은 괜찮았어요. 몇 군데만 다듬으면 훨씬 편안한 인상을 줄 수 있어요." : "질문을 급하게 이어가기보다 상대의 답에 반응하는 한 문장을 먼저 넣으면 훨씬 자연스러워져요.",
    tips,
  };
}
