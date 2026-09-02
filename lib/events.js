export const DATE_EVENTS = [
  { id:"silence", emoji:"…", title:"갑자기 5초 침묵", prompt:"대화가 잠깐 끊겼다. 어색함을 자연스럽게 풀어라." },
  { id:"phone", emoji:"📱", title:"상대 휴대폰 알림", prompt:"상대가 잠깐 휴대폰을 확인했다. 질투하거나 추궁하지 말고 흐름을 이어라." },
  { id:"ex", emoji:"💭", title:"전 연애 이야기가 나옴", prompt:"상대가 이전 연애를 가볍게 언급했다. 과도하게 캐묻지 말고 성숙하게 반응하라." },
  { id:"late", emoji:"⏰", title:"약속시간 이야기", prompt:"상대가 평소 시간 약속에 민감하다고 말했다." },
  { id:"food", emoji:"🌶️", title:"취향이 정반대", prompt:"음식 취향이 완전히 다르다는 사실이 드러났다." },
  { id:"travel", emoji:"✈️", title:"여행 스타일 충돌", prompt:"한쪽은 계획형, 한쪽은 즉흥형이다." },
  { id:"work", emoji:"💼", title:"일 얘기가 길어짐", prompt:"상대가 업무 스트레스 이야기를 길게 한다. 상담사가 되지 말고 공감 후 가볍게 전환하라." },
  { id:"salary", emoji:"💸", title:"연봉 질문", prompt:"상대가 소득이나 연봉을 간접적으로 물었다. 불편하지 않게 경계를 지켜라." },
  { id:"marriage", emoji:"💍", title:"결혼관 질문", prompt:"상대가 결혼 생각이 있는지 묻는다. 너무 무겁지 않게 솔직하게 대화하라." },
  { id:"kids", emoji:"🧸", title:"자녀 계획 질문", prompt:"상대가 자녀에 대한 생각을 조심스럽게 묻는다." },
  { id:"religion", emoji:"🕊️", title:"가치관 차이", prompt:"생활 가치관이 다를 수 있는 주제가 나왔다. 존중하며 대화하라." },
  { id:"politics", emoji:"🗳️", title:"민감한 사회 이슈", prompt:"논쟁적 주제가 나왔다. 설득 대결 대신 서로의 관점을 확인하라." },
  { id:"pet", emoji:"🐶", title:"반려동물 취향 차이", prompt:"한쪽은 동물을 매우 좋아하고 다른 쪽은 익숙하지 않다." },
  { id:"drink", emoji:"🍺", title:"술 취향 차이", prompt:"상대가 술을 거의 마시지 않는다고 말한다." },
  { id:"smoking", emoji:"🚭", title:"흡연 여부 질문", prompt:"생활습관 관련 민감한 질문이 나온다." },
  { id:"hobby", emoji:"🎮", title:"취미를 이해 못함", prompt:"상대가 당신의 취미를 잘 이해하지 못하는 반응을 보인다." },
  { id:"friend", emoji:"👥", title:"친구가 우연히 지나감", prompt:"상대 지인이 잠깐 인사하고 간다. 자연스럽게 상황을 넘겨라." },
  { id:"order", emoji:"☕", title:"주문 실수", prompt:"주문한 메뉴가 잘못 나왔다. 직원에게 과하게 화내지 않고 처리하는 상황이다." },
  { id:"spill", emoji:"💧", title:"음료를 살짝 쏟음", prompt:"작은 실수가 생겼다. 상대가 민망하지 않게 반응하라." },
  { id:"weather", emoji:"🌧️", title:"갑자기 비가 옴", prompt:"밖에 비가 내리기 시작했다. 이후 동선을 자연스럽게 이야기할 기회다." },
  { id:"bill", emoji:"🧾", title:"계산 타이밍", prompt:"계산할 시간이 다가왔다. 비용 문제를 부담스럽지 않게 다뤄라." },
  { id:"second", emoji:"📅", title:"두 번째 만남 암시", prompt:"상대가 다음 주말 계획을 가볍게 언급했다. 호감이 있다면 자연스럽게 연결할 수 있다." },
  { id:"compliment", emoji:"✨", title:"갑작스러운 칭찬", prompt:"상대가 당신을 구체적으로 칭찬했다. 과하게 부정하지 말고 자연스럽게 받아라." },
  { id:"tease", emoji:"😏", title:"가벼운 장난", prompt:"상대가 친근하게 장난을 건다. 공격적으로 받아들이지 말고 티키타카를 시도하라." },
  { id:"quiet", emoji:"🤐", title:"상대가 갑자기 조용해짐", prompt:"상대의 답변이 짧아졌다. 압박 질문을 연속으로 하지 말고 편한 주제로 전환하라." },
  { id:"opinion", emoji:"🤔", title:"의견 불일치", prompt:"영화나 콘텐츠 취향에 대해 의견이 정반대다." },
  { id:"family", emoji:"🏠", title:"가족 이야기", prompt:"상대가 가족과 가깝다고 이야기한다. 사적인 정보를 캐묻지 말고 관심을 표현하라." },
  { id:"distance", emoji:"🚇", title:"거리가 멀다는 사실", prompt:"서로 사는 지역이 꽤 멀다는 사실이 드러났다." },
  { id:"schedule", emoji:"📆", title:"서로 바쁜 일정", prompt:"평일과 주말 일정이 잘 맞지 않을 수 있다는 이야기가 나온다." },
  { id:"ending", emoji:"🌙", title:"이제 슬슬 헤어질 시간", prompt:"만남을 자연스럽게 마무리하면서 다음 연결 가능성을 남길 순간이다." }
];

export function pickEvent(turn, usedIds = []) {
  const available = DATE_EVENTS.filter(e => !usedIds.includes(e.id));
  if (!available.length) return null;
  const index = (turn * 7 + usedIds.length * 3) % available.length;
  return available[index];
}

export function chemistryState(score) {
  if (score >= 82) return { id:"spark", label:"호감 상승", emoji:"💗", tone:"상대가 먼저 질문하고 다음 만남 가능성을 열어둡니다." };
  if (score >= 66) return { id:"warm", label:"편안해짐", emoji:"😊", tone:"답변이 길어지고 개인적인 이야기가 조금씩 늘어납니다." };
  if (score >= 48) return { id:"neutral", label:"탐색 중", emoji:"🙂", tone:"아직 서로 알아보는 중이라 반응이 조심스럽습니다." };
  if (score >= 32) return { id:"cool", label:"거리감", emoji:"😐", tone:"답변이 짧아지고 상대가 먼저 질문하는 빈도가 줄어듭니다." };
  return { id:"cold", label:"어색함 증가", emoji:"🥶", tone:"상대가 대화를 마무리하려는 신호를 조금씩 보입니다." };
}

export function chemistryDelta(text) {
  let delta = 0;
  const t = (text || "").trim();
  if (/\?|어때|어떤|왜|뭐|좋아하세요|하세요/.test(t)) delta += 4;
  if (/그렇구나|그랬구나|재밌겠다|좋네요|이해|공감|ㅋㅋ|ㅎㅎ/.test(t)) delta += 5;
  if (/다음|같이|또 보고|또 만나|좋아 보여|멋지|예쁘|귀엽/.test(t)) delta += 4;
  if (t.length >= 18 && t.length <= 90) delta += 2;
  if (t.length <= 4) delta -= 6;
  if (/몰라|아무거나|글쎄|노잼|별로|싫은데|왜요\?*$/.test(t)) delta -= 7;
  if ((t.match(/저는|제가|나는|내가/g) || []).length >= 3 && !/\?/.test(t)) delta -= 4;
  return Math.max(-10, Math.min(10, delta));
}
