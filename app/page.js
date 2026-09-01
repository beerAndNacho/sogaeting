"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PERSONAS, PLACES, DIFFICULTIES, MISSIONS, QUICK_REPLIES } from "../lib/scenarios";

const PHASES = { SETUP: "setup", CHAT: "chat", RESULT: "result" };

function estimateChemistry(messages) {
  const users = messages.filter(m => m.role === "user");
  if (!users.length) return 35;
  const questions = users.filter(m => /\?|어때|나요|뭐|어떤|왜/.test(m.content)).length;
  const reactions = users.filter(m => /ㅋㅋ|ㅎㅎ|좋|그렇|재밌|궁금|의외|공감/.test(m.content)).length;
  const short = users.filter(m => m.content.trim().length <= 5).length;
  return Math.max(18, Math.min(96, 38 + users.length * 4 + questions * 4 + reactions * 4 - short * 5));
}

export default function Home() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [persona, setPersona] = useState("warm");
  const [place, setPlace] = useState("cafe");
  const [difficulty, setDifficulty] = useState("normal");
  const [mission, setMission] = useState("first-impression");
  const [nickname, setNickname] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("demo");
  const [bestScore, setBestScore] = useState(0);
  const [quickReplies, setQuickReplies] = useState(QUICK_REPLIES.slice(0, 3));
  const endRef = useRef(null);

  const selectedPersona = useMemo(() => PERSONAS.find(p => p.id === persona), [persona]);
  const selectedPlace = useMemo(() => PLACES.find(p => p.id === place), [place]);
  const selectedDifficulty = useMemo(() => DIFFICULTIES.find(d => d.id === difficulty), [difficulty]);
  const selectedMission = useMemo(() => MISSIONS.find(m => m.id === mission), [mission]);
  const userTurns = messages.filter(m => m.role === "user").length;
  const chemistry = estimateChemistry(messages);

  useEffect(() => {
    const saved = Number(localStorage.getItem("first-date-best") || 0);
    setBestScore(saved);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  function start() {
    setMessages([{ role: "assistant", content: selectedPersona.opener }]);
    setInput("");
    setTyping(false);
    setResult(null);
    setQuickReplies(QUICK_REPLIES.slice(0, 3));
    setPhase(PHASES.CHAT);
  }

  function rotateQuickReplies() {
    const shift = (userTurns + 1) % QUICK_REPLIES.length;
    const rotated = [...QUICK_REPLIES.slice(shift), ...QUICK_REPLIES.slice(0, shift)];
    setQuickReplies(rotated.slice(0, 3));
  }

  async function send(textOverride) {
    const text = (textOverride ?? input).trim();
    if (!text || typing) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setTyping(true);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona, place, difficulty, mission, messages: next }),
      });
      const data = await r.json();
      setMode(data.mode || "demo");
      setTimeout(() => {
        setMessages(m => [...m, { role: "assistant", content: data.reply }]);
        setTyping(false);
        rotateQuickReplies();
      }, 380);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "잠깐 연결이 끊겼네요. 방금 얘기 다시 한 번만 해줄래요?" }]);
      setTyping(false);
    }
  }

  async function finish() {
    if (userTurns < 2) return;
    const r = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, persona, place, difficulty, mission }),
    });
    const data = await r.json();
    setResult(data);
    if (data.overall > bestScore) {
      localStorage.setItem("first-date-best", String(data.overall));
      setBestScore(data.overall);
    }
    setPhase(PHASES.RESULT);
  }

  function reset() {
    setPhase(PHASES.SETUP);
    setMessages([]);
    setResult(null);
    setInput("");
  }

  if (phase === PHASES.SETUP) {
    return (
      <main className="shell">
        <section className="hero">
          <div className="brand">FIRST DATE LAB</div>
          <div className="heroEmoji">💬</div>
          <h1>소개팅도<br/>연습하면 덜 떨려요.</h1>
          <p>AI 상대와 실제처럼 대화하고, 말투·질문·공감·호감 표현을 리포트로 확인하세요.</p>
          <div className="heroBadges">
            <span>🔒 회원가입 없음</span><span>🎮 5분 연습</span><span>🏆 최고 {bestScore || "-"}점</span>
          </div>
        </section>

        <section className="card setupCard">
          <div className="sectionHead"><div><span>STEP 1</span><h3>오늘의 상대를 골라보세요</h3></div><small>8 characters</small></div>
          <div className="personaGrid">
            {PERSONAS.map(p => (
              <button key={p.id} className={`personaCard ${persona === p.id ? "selected" : ""}`} onClick={() => setPersona(p.id)}>
                <div className={`personaAvatar tone-${p.color}`}>{p.emoji}</div>
                <strong>{p.label}</strong>
                <small>{p.description}</small>
                <div className="traits">{p.traits.map(t => <span key={t}>{t}</span>)}</div>
              </button>
            ))}
          </div>

          <div className="sectionHead spaced"><div><span>STEP 2</span><h3>오늘 연습할 미션</h3></div></div>
          <div className="missionGrid">
            {MISSIONS.map(m => (
              <button key={m.id} className={mission === m.id ? "selected" : ""} onClick={() => setMission(m.id)}>
                <b>{m.emoji}</b><div><strong>{m.label}</strong><small>{m.description}</small></div>
              </button>
            ))}
          </div>

          <div className="sectionHead spaced"><div><span>STEP 3</span><h3>상황 설정</h3></div></div>
          <label className="inputLabel">닉네임 <small>선택 사항</small></label>
          <input className="textInput" value={nickname} onChange={e => setNickname(e.target.value.slice(0, 12))} placeholder="결과 리포트에만 표시돼요" />

          <label className="inputLabel">장소</label>
          <div className="placeGrid">
            {PLACES.map(p => <button key={p.id} className={place === p.id ? "active" : ""} onClick={() => setPlace(p.id)}><span>{p.emoji}</span>{p.label}</button>)}
          </div>

          <label className="inputLabel">난이도</label>
          <div className="difficultyGrid">
            {DIFFICULTIES.map(d => (
              <button key={d.id} className={difficulty === d.id ? "active" : ""} onClick={() => setDifficulty(d.id)}>
                <strong>{d.label}</strong><span>{"●".repeat(d.level)}{"○".repeat(3-d.level)}</span><small>{d.hint}</small>
              </button>
            ))}
          </div>

          <div className="selectionSummary">
            <div className={`personaAvatar small tone-${selectedPersona.color}`}>{selectedPersona.emoji}</div>
            <div><span>오늘의 시나리오</span><strong>{selectedPersona.label} · {selectedPlace.label} · {selectedMission.label}</strong></div>
          </div>
          <button className="primary" onClick={start}>소개팅 리허설 시작 <span>→</span></button>
        </section>
        <p className="footnote">대화 연습용 시뮬레이션이며 실제 사람의 호감이나 관계 결과를 예측하지 않습니다.</p>
      </main>
    );
  }

  if (phase === PHASES.CHAT) {
    return (
      <main className="chatShell">
        <header className="chatHeader">
          <button className="iconBtn" onClick={reset}>←</button>
          <div className={`personaAvatar tiny tone-${selectedPersona.color}`}>{selectedPersona.emoji}</div>
          <div className="chatTitle"><strong>{selectedPersona.label}</strong><span>{selectedPlace.label} · {selectedDifficulty.label}</span></div>
          <button className="endBtn" onClick={finish} disabled={userTurns < 2}>리포트</button>
        </header>

        <section className="gameHud">
          <div className="hudTop"><span>{selectedMission.emoji} 미션 · {selectedMission.label}</span><b>{mode.startsWith("live") ? "AI LIVE" : "DEMO"}</b></div>
          <div className="chemistry"><div><span>현재 대화 케미</span><strong>{chemistry}%</strong></div><i><b style={{ width: `${chemistry}%` }} /></div>
          <div className="turnDots">{Array.from({length:10}).map((_, i) => <span key={i} className={i < userTurns ? "done" : i === userTurns ? "now" : ""} />)}</div>
        </section>

        <section className="messages">
          <div className="sceneCard"><span>{selectedPlace.emoji}</span><div><strong>{selectedPlace.scene}</strong><p>완벽한 답을 찾지 말고 실제로 말하듯 답해보세요.</p></div></div>
          {messages.map((m, i) => (
            <div key={i} className={`row ${m.role}`}>
              {m.role === "assistant" && <div className={`personaAvatar msgAvatar tone-${selectedPersona.color}`}>{selectedPersona.emoji}</div>}
              <div className="bubble">{m.content}</div>
            </div>
          ))}
          {typing && <div className="row assistant"><div className={`personaAvatar msgAvatar tone-${selectedPersona.color}`}>{selectedPersona.emoji}</div><div className="bubble typing"><b/><b/><b/></div></div>}
          <div ref={endRef} />
        </section>

        <footer className="composer">
          {userTurns > 0 && !typing && <div className="quickReplies">{quickReplies.map(q => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>}
          <div className="coachHint">💡 {userTurns < 3 ? "상대의 말에 반응한 뒤 질문하면 더 자연스러워요." : chemistry < 60 ? "내 이야기만 하기보다 상대에게 다시 공을 넘겨보세요." : "좋아요. 이제 가벼운 호감 표현도 시도해보세요."}</div>
          <div className="inputRow"><textarea rows={1} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="실제로 말하듯 입력해보세요"/><button onClick={() => send()} disabled={!input.trim() || typing}>↑</button></div>
          <button className="finishLink" onClick={finish} disabled={userTurns < 2}>{userTurns < 2 ? "2번 이상 대화하면 리포트를 볼 수 있어요" : "대화를 마치고 분석 리포트 보기"}</button>
        </footer>
      </main>
    );
  }

  const isNewBest = result?.overall >= bestScore && result?.overall > 0;
  return (
    <main className="shell resultShell">
      <section className="resultHero">
        <div className="brand">FIRST DATE REPORT</div>
        {isNewBest && <div className="newBest">🏆 PERSONAL BEST</div>}
        <div className="scoreRing" style={{ "--score": `${result?.overall || 0}%` }}><strong>{result?.overall}</strong><span>점</span></div>
        <h1>{nickname ? `${nickname}님의 ` : ""}소개팅 리포트</h1>
        <div className="styleBadge">{result?.style}</div>
        <p>{result?.summary}</p>
      </section>

      <section className="card reportCard">
        <div className="reportScenario"><span>{selectedPersona.emoji}</span><div><small>이번 연습</small><strong>{selectedPersona.label} · {selectedMission.label}</strong><p>{selectedPlace.label} / {selectedDifficulty.label} 난이도 / {userTurns}턴 대화</p></div></div>
        <h2>대화 능력치</h2>
        <div className="metrics">{Object.values(result?.metrics || {}).map(m => <div className="metric" key={m.label}><div><span>{m.label}</span><strong>{m.score}</strong></div><i><b style={{ width: `${m.score}%` }}/></i></div>)}</div>

        <div className="insightGrid">
          <div className="insight strength"><span>👍</span><strong>잘한 점</strong><ul>{(result?.strengths || []).map((t,i)=><li key={i}>{t}</li>)}</ul></div>
          <div className="insight coach"><span>✨</span><strong>다음에 고칠 점</strong><ul>{(result?.tips || []).map((t,i)=><li key={i}>{t}</li>)}</ul></div>
        </div>

        <div className="nextChallenge"><span>🎯 NEXT CHALLENGE</span><strong>{result?.nextChallenge}</strong><p>점수를 올리는 것보다 다른 유형의 상대에게 적응해보는 게 실전에 더 도움이 됩니다.</p></div>

        <div className="resultActions"><button className="primary" onClick={start}>같은 조건으로 재도전</button><button className="secondary" onClick={reset}>새 시나리오 선택</button></div>
      </section>
      <p className="footnote">점수는 대화 연습용 참고 지표이며 실제 상대방의 감정을 측정하지 않습니다.</p>
    </main>
  );
}
