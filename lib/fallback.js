const questionPool = {
  cafe: ["쉬는 날에는 보통 뭐 하면서 보내세요?", "요즘 제일 자주 듣는 음악이나 보는 콘텐츠 있어요?", "여행 가면 계획 세우는 편이에요, 즉흥적인 편이에요?", "일 얘기 말고 요즘 가장 재밌는 게 뭐예요?", "친구들이 본인을 한 단어로 표현하면 뭐라고 할 것 같아요?"],
  bar: ["분위기 좋은 곳 자주 찾아다니세요?", "술은 분위기로 마시는 편이에요, 맛으로 마시는 편이에요?", "친구들이 본인을 어떤 사람이라고 많이 말해요?", "사람 볼 때 은근히 중요하게 보는 게 있어요?", "오늘 같은 자리에서 상대가 먼저 해주면 좋은 말이 있어요?"],
  restaurant: ["맛집 찾아다니는 거 좋아하세요?", "매운 거 잘 드세요? 저는 메뉴 고를 때 은근 중요하더라고요.", "먹는 것 말고 요즘 빠져 있는 취미 있어요?", "휴가 생기면 국내랑 해외 중 어디가 더 끌려요?", "같이 먹으러 가보고 싶은 음식 있어요?"],
  walk: ["걷는 거 좋아하세요? 이런 날씨면 산책하기 괜찮네요.", "혼자 있는 시간도 좋아하는 편이에요?", "요즘 기분 좋아지는 작은 일이 있다면 뭐예요?", "주말 하루가 완전히 비면 어떻게 보내고 싶어요?", "오늘 대화해보니까 처음 생각했던 이미지랑 좀 달라요?"],
  brunch: ["주말 아침형이에요, 늦잠형이에요?", "브런치 먹고 하루 종일 놀 수 있다면 뭐 하고 싶어요?", "카페 오래 앉아 있는 편이에요?", "요즘 새로 시작해보고 싶은 취미 있어요?", "휴일에 제일 아깝다고 느끼는 순간이 언제예요?"],
  museum: ["전시 볼 때 설명을 꼼꼼히 읽는 편이에요?", "사진 찍는 거 좋아하세요, 그냥 보는 걸 좋아하세요?", "취향이 완전 다른 사람이랑 데이트해도 괜찮아요?", "최근에 기억에 남는 작품이나 영화 있어요?", "다음에는 어떤 곳 같이 가보고 싶어요?"],
};

const reactions = ["오 그건 의외네요.", "그 얘기는 좀 재밌는데요?", "아 그 느낌 알 것 같아요.", "그렇게 생각할 수도 있겠네요.", "듣다 보니 더 궁금해졌어요."];
const silences = ["음... 잠깐 생각했어요.", "아, 그렇구나.", "ㅎㅎ 갑자기 조금 조용해졌네요."];
const eventQuestions = ["근데 소개팅에서 제일 어색한 순간이 언제라고 생각해요?", "만약 오늘 서로 취향이 완전 다르면 그래도 한 번 더 볼 수 있어요?", "첫인상하고 지금 인상이 달라지면 좋은 쪽이에요, 안 좋은 쪽이에요?"];

function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

function personaReaction(persona) {
  const map = {
    warm: ["그랬구나 :) ", "오 좋네요. ", "그 얘기 들으니까 좀 편해지네요. "],
    quiet: ["아... 그렇구나. ", "저도 그런 편이에요. ", "그건 조금 공감돼요. "],
    playful: ["ㅋㅋ 그건 반칙 아닌가요? ", "오 의외인데요? ㅋㅋ ", "그럼 제가 하나 기억해둘게요. "],
    direct: ["그건 솔직해서 좋네요. ", "오, 생각이 분명하시네요. ", "그럼 하나 더 물어볼게요. "],
    career: ["현실적으로 보면 이해돼요. ", "그런 기준이 있군요. ", "생각보다 계획적인 편이네요. "],
    curious: ["오 왜 그렇게 생각해요? ", "그 부분 더 듣고 싶은데요. ", "그건 처음 듣는 스타일이에요. "],
    cool: ["아 그렇군요. ", "음, 알겠어요. ", "그럴 수 있죠. "],
    romantic: ["그런 얘기 좋네요. ", "그 장면은 좀 기억에 남을 것 같아요. ", "그런 취향이면 분위기 중요하겠네요. "],
  };
  return map[persona] || map.warm;
}

export function fallbackReply({ persona = "warm", place = "cafe", difficulty = "normal", mission = "first-impression", messages = [] }) {
  const users = messages.filter(m => m.role === "user");
  const last = users.at(-1)?.content || "";
  const pool = questionPool[place] || questionPool.cafe;
  const seed = hash(last + users.length + persona + mission);
  const reactionSet = personaReaction(persona);
  const reaction = reactionSet[seed % reactionSet.length];
  const idx = seed % pool.length;

  if (users.length === 1) {
    if (last.length < 6) return difficulty === "hard" ? `아... 네. ${pool[idx]}` : `${reaction}${pool[idx]}`;
    return `${reaction}${pool[idx]}`;
  }

  if (difficulty === "hard" && users.length % 3 === 0) {
    const silence = silences[seed % silences.length];
    return `${silence} ${eventQuestions[seed % eventQuestions.length]}`;
  }

  if (mission === "second-date" && users.length >= 6) {
    return `${reaction}오늘 이야기해보니까 생각보다 시간이 빨리 가네요. 보통 마음에 들면 다음 약속은 바로 잡는 편이에요?`;
  }

  if (mission === "flirting" && users.length >= 4 && users.length % 2 === 0) {
    return `${reaction}근데 아까보다 지금이 훨씬 덜 어색한 것 같아요. 원래 처음 만난 사람이랑 금방 편해지는 편이에요?`;
  }

  if (mission === "humor" && users.length % 3 === 0) {
    return persona === "playful" ? `ㅋㅋ 좋네요. 그러면 갑자기 밸런스 게임 하나 할게요. 여행 계획 1분 단위 애인 vs 무계획 애인, 어느 쪽이에요?` : `${reaction}${eventQuestions[seed % eventQuestions.length]}`;
  }

  if (last.includes("?")) {
    const answer = ["저는 너무 계획적인 건 답답해서 적당히 즉흥적인 게 좋아요.", "저는 사람 많은 곳보다 둘이 얘기할 수 있는 곳이 좋아요.", "저는 취향보다 같이 있을 때 편한 게 더 중요한 것 같아요."][seed % 3];
    return `${answer} ${pool[idx]}`;
  }

  return `${reaction}${pool[idx]}`;
}

export function fallbackEvaluation(messages) {
  const users = messages.filter(m => m.role === "user").map(m => m.content.trim()).filter(Boolean);
  const totalChars = users.reduce((a, b) => a + b.length, 0);
  const avgLength = users.length ? totalChars / users.length : 0;
  const questions = users.filter(t => t.includes("?") || /어때|세요|나요|뭐|어디|언제|왜|어떤/.test(t)).length;
  const empathy = users.filter(t => /그렇|맞아|좋|이해|재밌|공감|궁금|ㅋㅋ|ㅎㅎ|의외/.test(t)).length;
  const interestWords = users.filter(t => /다음|또|같이|궁금|좋아|재밌|보고|가고|먹고|만나/.test(t)).length;
  const oneWord = users.filter(t => t.length <= 5).length;
  const selfOnly = users.filter(t => /^저는|^나는|^제가/.test(t)).length;

  const clamp = n => Math.max(38, Math.min(97, Math.round(n)));
  const natural = clamp(60 + Math.min(24, avgLength * 0.8) - oneWord * 3);
  const question = clamp(48 + questions * 8 - Math.max(0, questions - Math.ceil(users.length * .65)) * 5);
  const empathyScore = clamp(52 + empathy * 8);
  const interest = clamp(50 + interestWords * 7);
  const balance = clamp(75 - Math.max(0, selfOnly - Math.ceil(users.length / 2)) * 7 + empathy * 3);
  const overall = Math.round((natural + question + empathyScore + interest + balance) / 5);

  const strengths = [];
  if (natural >= 78) strengths.push("말투가 길거나 딱딱하지 않아 실제 대화처럼 자연스러웠어요.");
  if (question >= 78) strengths.push("상대의 말을 이어가는 질문을 잘 사용했어요.");
  if (empathyScore >= 78) strengths.push("반응과 공감 표현이 있어 상대가 편하게 느낄 가능성이 높아요.");
  if (interest >= 78) strengths.push("호감과 관심을 과하지 않게 표현했어요.");
  if (!strengths.length) strengths.push("끝까지 대화를 이어간 것 자체가 좋은 연습이 됐어요.");

  const tips = [];
  if (question < 70) tips.push("상대 답변에서 한 단어를 잡아 짧은 꼬리질문을 해보세요.");
  if (empathyScore < 70) tips.push("질문 전에 ‘아 그랬구나’, ‘그거 재밌겠다’ 같은 반응을 한 번 넣어보세요.");
  if (interest < 70) tips.push("대화 후반에는 ‘다음에 같이 해보고 싶다’는 작은 호감 신호를 표현해보세요.");
  if (balance < 70) tips.push("내 이야기 뒤에는 상대에게 다시 공을 넘기는 한 문장을 붙여보세요.");
  if (natural < 70) tips.push("한 번에 많은 내용을 말하기보다 한두 문장씩 주고받아보세요.");
  if (!tips.length) tips.push("현재 흐름이 안정적이에요. 다음에는 표현이 적은 상대나 고난도로 도전해보세요.");

  const style = question >= 80 && empathyScore >= 75 ? "대화를 살리는 탐색형" : interest >= 80 ? "호감을 자연스럽게 드러내는 표현형" : natural >= 80 ? "편안함을 만드는 안정형" : "신중하게 분위기를 보는 관찰형";
  const nextChallenge = overall >= 82 ? "고난도 · 무심한 쿨형 상대에게 도전" : question < 70 ? "호기심 질문형 상대와 꼬리질문 3회 성공" : "호감 표현 미션으로 한 번 더 연습";

  return {
    overall,
    style,
    metrics: {
      natural: { label: "자연스러움", score: natural },
      question: { label: "질문력", score: question },
      empathy: { label: "공감", score: empathyScore },
      interest: { label: "호감 표현", score: interest },
      balance: { label: "대화 균형", score: balance },
    },
    summary: overall >= 84 ? "실전에서도 편안한 분위기를 만들 가능성이 높아요. 다음 단계는 상대의 미묘한 반응을 읽는 연습입니다." : overall >= 70 ? "전체 흐름은 괜찮았어요. 한두 가지 습관만 다듬으면 훨씬 매력적인 대화가 됩니다." : "질문을 연속으로 던지기보다 상대의 답에 반응하는 한 문장을 먼저 넣으면 대화가 훨씬 자연스러워져요.",
    strengths,
    tips,
    nextChallenge,
  };
}
