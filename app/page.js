"use client";

import { useMemo, useState } from "react";
import { PERSONAS, PLACES, DIFFICULTIES } from "../lib/scenarios";

export default function Home() {
  const [phase, setPhase] = useState("setup");
  const [persona, setPersona] = useState("warm");
  const [place, setPlace] = useState("cafe");
  const [difficulty, setDifficulty] = useState("normal");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [result, setResult] = useState(null);
  const selectedPersona = useMemo(() => PERSONAS.find(p => p.id === persona), [persona]);

  function start() {
    setMessages([{ role: "assistant", content: selectedPersona.opener }]);
    setPhase("chat");
  }

  async function send() {
    const text = input.trim();
    if (!text || typing) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next); setInput(""); setTyping(true);
    const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ persona, place, difficulty, messages: next }) });
    const data = await r.json();
    setMessages(m => [...m, { role: "assistant", content: data.reply }]);
    setTyping(false);
  }

  async function finish() {
    const r = await fetch("/api/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages }) });
    setResult(await r.json()); setPhase("result");
  }

  if (phase === "setup") return (
    <main className="shell">
      <section className="hero">
        <div className="brand">FIRST DATE LAB</div>
        <div className="heroEmoji">💬</div>
        <h1>첫 만남 전에,<br/>한 번 연습해볼래요?</h1>
        <p>상대 성격과 난이도를 고르고 실제처럼 대화한 뒤 내 대화 스타일을 확인하세요.</p>
        <div className="privacy">🔒 회원가입 없음 · 사진/전화번호 수집 없음</div>
      </section>
      <section className="card">
        <h3>어떤 상대와 연습할까요?</h3>
        <div className="grid">
          {PERSONAS.map(p => <button key={p.id} className={persona===p.id?"selected":""} onClick={()=>setPersona(p.id)}><span>{p.emoji}</span><strong>{p.label}</strong><small>{p.description}</small></button>)}
        </div>
        <h3>장소</h3>
        <div className="chips">{PLACES.map(p => <button key={p.id} className={place===p.id?"active":""} onClick={()=>setPlace(p.id)}>{p.emoji} {p.label}</button>)}</div>
        <h3>난이도</h3>
        <div className="chips">{DIFFICULTIES.map(d => <button key={d.id} className={difficulty===d.id?"active":""} onClick={()=>setDifficulty(d.id)}>{d.label}</button>)}</div>
        <button className="primary" onClick={start}>소개팅 시작하기 →</button>
      </section>
    </main>
  );

  if (phase === "chat") return (
    <main className="chatShell">
      <header><button onClick={()=>setPhase("setup")}>←</button><div className="avatar">{selectedPersona.emoji}</div><div><strong>{selectedPersona.label}</strong><small>{PLACES.find(p=>p.id===place)?.label} · {DIFFICULTIES.find(d=>d.id===difficulty)?.label}</small></div><button onClick={finish}>종료</button></header>
      <section className="messages">
        {messages.map((m,i)=><div key={i} className={`row ${m.role}`}><div className="bubble">{m.content}</div></div>)}
        {typing && <div className="row assistant"><div className="bubble">입력 중...</div></div>}
      </section>
      <footer><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="메시지를 입력하세요"/><button onClick={send}>↑</button></footer>
    </main>
  );

  return (
    <main className="shell result">
      <section className="hero"><div className="brand">FIRST DATE REPORT</div><div className="score">{result?.overall}</div><h1>오늘의 대화 리포트</h1><p>{result?.summary}</p></section>
      <section className="card">
        {Object.values(result?.metrics||{}).map(m=><div className="metric" key={m.label}><div><span>{m.label}</span><strong>{m.score}</strong></div><i><b style={{width:`${m.score}%`}}/></i></div>)}
        <div className="tips"><strong>다음 만남에서 이렇게 해보세요</strong><ul>{(result?.tips||[]).map((t,i)=><li key={i}>{t}</li>)}</ul></div>
        <button className="primary" onClick={()=>{setResult(null);start();}}>다시 연습하기</button>
      </section>
    </main>
  );
}
