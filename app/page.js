"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PERSONAS, PLACES, DIFFICULTIES, MISSIONS, QUICK_REPLIES } from "../lib/scenarios";
import { pickEvent, chemistryDelta, chemistryState } from "../lib/events";

const PHASES={SETUP:"setup",CHAT:"chat",RESULT:"result",POST:"post"};
const POST_GOALS=[
  {id:"thanks",emoji:"🙂",label:"깔끔한 감사 인사",desc:"부담 없이 좋은 인상으로 마무리"},
  {id:"second-date",emoji:"💗",label:"두 번째 약속 잡기",desc:"자연스럽게 다음 만남 제안"},
  {id:"recover",emoji:"🛟",label:"어색했던 만남 복구",desc:"실수나 어색함을 가볍게 풀기"}
];

export default function Home(){
  const [phase,setPhase]=useState(PHASES.SETUP);
  const [persona,setPersona]=useState("warm"),[place,setPlace]=useState("cafe"),[difficulty,setDifficulty]=useState("normal"),[mission,setMission]=useState("first-impression");
  const [nickname,setNickname]=useState("");
  const [messages,setMessages]=useState([]),[input,setInput]=useState(""),[typing,setTyping]=useState(false),[result,setResult]=useState(null),[mode,setMode]=useState("demo");
  const [chemistry,setChemistry]=useState(50),[usedEvents,setUsedEvents]=useState([]),[activeEvent,setActiveEvent]=useState(null),[bestScore,setBestScore]=useState(0);
  const [postGoal,setPostGoal]=useState("thanks"),[postMessages,setPostMessages]=useState([]),[postInput,setPostInput]=useState(""),[postTyping,setPostTyping]=useState(false);
  const endRef=useRef(null);
  const selectedPersona=useMemo(()=>PERSONAS.find(p=>p.id===persona),[persona]);
  const selectedPlace=useMemo(()=>PLACES.find(p=>p.id===place),[place]);
  const selectedDifficulty=useMemo(()=>DIFFICULTIES.find(d=>d.id===difficulty),[difficulty]);
  const selectedMission=useMemo(()=>MISSIONS.find(m=>m.id===mission),[mission]);
  const state=chemistryState(chemistry);
  const userTurns=messages.filter(m=>m.role==="user").length;

  useEffect(()=>setBestScore(Number(localStorage.getItem("first-date-best")||0)),[]);
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth",block:"end"}),[messages,typing,postMessages,postTyping]);

  function start(){
    setMessages([{role:"assistant",content:selectedPersona.opener}]); setChemistry(50); setUsedEvents([]); setActiveEvent(null); setResult(null); setInput(""); setPhase(PHASES.CHAT);
  }

  function nextEvent(turn){
    if (![3,6,9].includes(turn)) return null;
    const ev=pickEvent(turn,usedEvents); if(ev){setUsedEvents(v=>[...v,ev.id]);setActiveEvent(ev);} return ev;
  }

  async function send(textOverride){
    const text=(textOverride??input).trim(); if(!text||typing) return;
    const delta=chemistryDelta(text); const nextChem=Math.max(10,Math.min(96,chemistry+delta)); setChemistry(nextChem);
    const next=[...messages,{role:"user",content:text}]; setMessages(next); setInput(""); setTyping(true);
    const ev=nextEvent(userTurns+1); const cState=chemistryState(nextChem).id;
    try{
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({persona,place,difficulty,mission,messages:next,chemistry:nextChem,chemistryState:cState,activeEvent:ev})});
      const data=await r.json(); setMode(data.mode||"demo");
      setTimeout(()=>{setMessages(m=>[...m,{role:"assistant",content:data.reply}]);setTyping(false);if(ev)setTimeout(()=>setActiveEvent(null),1300);},360);
    }catch{setMessages(m=>[...m,{role:"assistant",content:"잠깐 연결이 끊겼네요. 방금 얘기 다시 한 번만 해줄래요?"}]);setTyping(false);}
  }

  async function finish(){
    if(userTurns<2)return;
    const r=await fetch("/api/evaluate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages,persona,place,difficulty,mission,chemistry,events:usedEvents})});
    const data=await r.json(); setResult(data); if(data.overall>bestScore){localStorage.setItem("first-date-best",String(data.overall));setBestScore(data.overall);} setPhase(PHASES.RESULT);
  }

  function startPost(){setPostMessages([{role:"assistant",content:chemistry>=70?"저 잘 들어왔어요 ㅎㅎ 오늘 재밌었어요!":"저 잘 들어왔어요. 오늘 반가웠어요 :)"}]);setPostInput("");setPhase(PHASES.POST);}
  async function sendPost(textOverride){
    const text=(textOverride??postInput).trim(); if(!text||postTyping)return;
    const next=[...postMessages,{role:"user",content:text}]; setPostMessages(next); setPostInput(""); setPostTyping(true);
    try{const r=await fetch("/api/postdate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next,chemistry,goal:postGoal})});const data=await r.json();setTimeout(()=>{setPostMessages(m=>[...m,{role:"assistant",content:data.reply}]);setPostTyping(false);},300);}catch{setPostMessages(m=>[...m,{role:"assistant",content:"저도 오늘 반가웠어요 :)"}]);setPostTyping(false);}
  }
  function reset(){setPhase(PHASES.SETUP);setMessages([]);setPostMessages([]);setResult(null);setInput("");}

  if(phase===PHASES.SETUP)return <main className="shell">
    <section className="hero"><div className="brand">FIRST DATE LAB</div><div className="heroEmoji">💬</div><h1>소개팅도<br/>연습하면 덜 떨려요.</h1><p>AI 상대와 실제처럼 대화하고 돌발상황, 호감도 변화, 소개팅 후 카톡까지 연습하세요.</p><div className="heroBadges"><span>🔒 회원가입 없음</span><span>🎲 30개 돌발상황</span><span>🏆 최고 {bestScore||"-"}점</span></div></section>
    <section className="card setupCard">
      <div className="sectionHead"><div><span>STEP 1</span><h3>오늘의 상대</h3></div></div>
      <div className="personaGrid">{PERSONAS.map(p=><button key={p.id} className={`personaCard ${persona===p.id?"selected":""}`} onClick={()=>setPersona(p.id)}><div className={`personaAvatar tone-${p.color}`}>{p.emoji}</div><strong>{p.label}</strong><small>{p.description}</small><div className="traits">{p.traits.map(t=><span key={t}>{t}</span>)}</div></button>)}</div>
      <div className="sectionHead spaced"><div><span>STEP 2</span><h3>오늘의 연습 미션</h3></div></div>
      <div className="missionGrid">{MISSIONS.map(m=><button key={m.id} className={mission===m.id?"selected":""} onClick={()=>setMission(m.id)}><b>{m.emoji}</b><div><strong>{m.label}</strong><small>{m.description}</small></div></button>)}</div>
      <div className="sectionHead spaced"><div><span>STEP 3</span><h3>상황 설정</h3></div></div>
      <label className="inputLabel">닉네임 <small>선택</small></label><input className="textInput" value={nickname} onChange={e=>setNickname(e.target.value.slice(0,12))} placeholder="결과에만 표시돼요"/>
      <label className="inputLabel">장소</label><div className="placeGrid">{PLACES.map(p=><button key={p.id} className={place===p.id?"active":""} onClick={()=>setPlace(p.id)}><span>{p.emoji}</span>{p.label}</button>)}</div>
      <label className="inputLabel">난이도</label><div className="difficultyGrid">{DIFFICULTIES.map(d=><button key={d.id} className={difficulty===d.id?"active":""} onClick={()=>setDifficulty(d.id)}><strong>{d.label}</strong><span>{"●".repeat(d.level)}{"○".repeat(3-d.level)}</span><small>{d.hint}</small></button>)}</div>
      <button className="primary" onClick={start}>소개팅 리허설 시작 →</button>
    </section><p className="footnote">연습용 시뮬레이션이며 실제 사람의 감정이나 관계 결과를 예측하지 않습니다.</p>
  </main>;

  if(phase===PHASES.CHAT)return <main className="chatShell">
    <header className="chatHeader"><button className="iconBtn" onClick={reset}>←</button><div className={`personaAvatar tiny tone-${selectedPersona.color}`}>{selectedPersona.emoji}</div><div className="chatTitle"><strong>{selectedPersona.label}</strong><span>{selectedPlace.label} · {selectedDifficulty.label}</span></div><button className="endBtn" onClick={finish} disabled={userTurns<2}>리포트</button></header>
    <section className="gameHud"><div className="hudTop"><span>{selectedMission.emoji} {selectedMission.label}</span><b>{mode.startsWith("live")?"AI LIVE":"DEMO"}</b></div><div className="stateLine"><strong>{state.emoji} {state.label}</strong><span>{state.tone}</span></div><div className="chemistry"><div><span>대화 케미</span><strong>{chemistry}%</strong></div><i><b style={{width:`${chemistry}%`}}/></i></div><div className="turnDots">{Array.from({length:10}).map((_,i)=><span key={i} className={i<userTurns?"done":i===userTurns?"now":""}/>)}</div></section>
    <section className="messages"><div className="sceneCard"><span>{selectedPlace.emoji}</span><div><strong>{selectedPlace.scene}</strong><p>3·6·9턴에는 예상하지 못한 상황이 등장합니다.</p></div></div>
      {messages.map((m,i)=><div key={i} className={`row ${m.role}`}>{m.role==="assistant"&&<div className={`personaAvatar msgAvatar tone-${selectedPersona.color}`}>{selectedPersona.emoji}</div>}<div className="bubble">{m.content}</div></div>)}
      {activeEvent&&<div className="eventCard"><span>{activeEvent.emoji}</span><div><b>돌발상황</b><strong>{activeEvent.title}</strong><p>{activeEvent.prompt}</p></div></div>}
      {typing&&<div className="row assistant"><div className={`personaAvatar msgAvatar tone-${selectedPersona.color}`}>{selectedPersona.emoji}</div><div className="bubble typing"><b/><b/><b/></div></div>}<div ref={endRef}/>
    </section>
    <footer className="composer">{userTurns>0&&!typing&&<div className="quickReplies">{QUICK_REPLIES.slice((userTurns*2)%QUICK_REPLIES.length).concat(QUICK_REPLIES).slice(0,3).map(q=><button key={q} onClick={()=>send(q)}>{q}</button>)}</div>}<div className="coachHint">💡 {chemistry<40?"압박하지 말고 공감 한마디 뒤에 편한 주제로 바꿔보세요.":chemistry>75?"좋은 흐름입니다. 자연스럽게 다음 만남의 여지를 만들어보세요.":"내 이야기와 상대 질문을 번갈아 섞어보세요."}</div><div className="inputRow"><textarea rows={1} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="실제로 말하듯 입력해보세요"/><button onClick={()=>send()} disabled={!input.trim()||typing}>↑</button></div><button className="finishLink" onClick={finish} disabled={userTurns<2}>{userTurns<2?"2번 이상 대화하면 리포트를 볼 수 있어요":"대화를 마치고 분석 리포트 보기"}</button></footer>
  </main>;

  if(phase===PHASES.POST)return <main className="chatShell postShell">
    <header className="chatHeader"><button className="iconBtn" onClick={()=>setPhase(PHASES.RESULT)}>←</button><div className={`personaAvatar tiny tone-${selectedPersona.color}`}>{selectedPersona.emoji}</div><div className="chatTitle"><strong>{selectedPersona.label}</strong><span>소개팅 후 카톡 연습</span></div><button className="endBtn" onClick={reset}>끝내기</button></header>
    <section className="postGoal"><span>카톡 미션</span><div>{POST_GOALS.map(g=><button key={g.id} className={postGoal===g.id?"active":""} onClick={()=>setPostGoal(g.id)}><b>{g.emoji} {g.label}</b><small>{g.desc}</small></button>)}</div></section>
    <section className="messages kakao"><div className="sceneCard"><span>📱</span><div><strong>집에 도착한 뒤 첫 카톡</strong><p>길게 쓰기보다 실제 메신저처럼 짧게 보내보세요.</p></div></div>{postMessages.map((m,i)=><div key={i} className={`row ${m.role}`}><div className="bubble">{m.content}</div></div>)}{postTyping&&<div className="row assistant"><div className="bubble typing"><b/><b/><b/></div></div>}<div ref={endRef}/></section>
    <footer className="composer"><div className="quickReplies"><button onClick={()=>sendPost("오늘 즐거웠어요! 조심히 들어갔어요?")}>감사 인사</button><button onClick={()=>sendPost("아까 얘기한 곳 다음에 같이 가요 ㅎㅎ")}>다음 약속</button><button onClick={()=>sendPost("오늘 제가 좀 긴장했죠 ㅋㅋ 그래도 반가웠어요")}>어색함 복구</button></div><div className="inputRow"><textarea rows={1} value={postInput} onChange={e=>setPostInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendPost();}}} placeholder="첫 카톡을 보내보세요"/><button onClick={()=>sendPost()} disabled={!postInput.trim()||postTyping}>↑</button></div></footer>
  </main>;

  return <main className="shell resultShell"><section className="resultHero"><div className="brand">FIRST DATE REPORT</div><div className="scoreRing" style={{"--score":`${result?.overall||0}%`}}><strong>{result?.overall}</strong><span>점</span></div><h1>{nickname?`${nickname}님의 `:""}소개팅 리포트</h1><div className="styleBadge">{result?.style}</div><p>{result?.summary}</p><div className="finalState">{state.emoji} 마지막 관계 상태: <b>{state.label}</b> · 케미 {chemistry}%</div></section>
    <section className="card reportCard"><h2>대화 능력치</h2><div className="metrics">{Object.values(result?.metrics||{}).map(m=><div className="metric" key={m.label}><div><span>{m.label}</span><strong>{m.score}</strong></div><i><b style={{width:`${m.score}%`}}/></i></div>)}</div><div className="insightGrid"><div className="insight strength"><span>👍</span><strong>잘한 점</strong><ul>{(result?.strengths||[]).map((t,i)=><li key={i}>{t}</li>)}</ul></div><div className="insight coach"><span>✨</span><strong>다음에 고칠 점</strong><ul>{(result?.tips||[]).map((t,i)=><li key={i}>{t}</li>)}</ul></div></div><div className="nextChallenge"><span>🎲 오늘 만난 돌발상황 {usedEvents.length}개</span><strong>{result?.nextChallenge}</strong><p>소개팅 자체가 끝나도 실제로 어려운 건 첫 카톡입니다. 바로 이어서 연습해보세요.</p></div><button className="primary postCta" onClick={startPost}>📱 소개팅 후 첫 카톡 연습하기 →</button><div className="resultActions"><button className="secondary" onClick={start}>같은 조건 재도전</button><button className="secondary" onClick={reset}>새 시나리오 선택</button></div></section><p className="footnote">점수와 케미는 연습을 위한 게임 지표이며 실제 상대방의 감정을 측정하지 않습니다.</p></main>;
}
