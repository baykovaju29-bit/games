import React, { useMemo, useState } from "react";
import { shuffle } from "../utils";

function norm(s){
  return (s||"").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ").trim();
}

export default function TypeTheWord({ pairs = [] }) {
  const deck = useMemo(() => shuffle(pairs), [pairs]);
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState("");

  if (!deck.length) return <p>No data.</p>;
  const q = deck[i];

  function check(){
    if (norm(val) === norm(q.term)) {
      setScore(s=>s+1); setStreak(st=>st+1); setMsg("✅ Correct");
      setTimeout(()=>{ setI(n=>(n+1)%deck.length); setVal(""); setTries(0); setMsg(""); }, 600);
    } else {
      setStreak(0); setTries(t=>t+1); setMsg("❌ Try again");
    }
  }
  function hint(){
    const n = Math.min(1 + tries, q.term.length);
    setVal(q.term.slice(0, n));
  }

  return (
    <div>
      <p>Question {i + 1}/{deck.length} · Score: {score} · Streak: {streak}</p>
      <div style={{padding:12, border:"1px solid #ddd", marginBottom:8, background:"#fff"}}>{q.def}</div>
      <div style={{display:"flex", gap:8}}>
        <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="Type the word…" style={{flex:1, padding:"10px 12px"}} />
        <button onClick={check}>Check</button>
      </div>
      <div style={{display:"flex", gap:8, marginTop:8}}>
        <button onClick={hint}>Hint</button>
        <button onClick={()=>setVal(q.term)}>Reveal</button>
        <button onClick={()=>{ setI(n=>(n+1)%deck.length); setVal(""); setTries(0); setMsg(""); }}>Skip</button>
      </div>
      {msg && <p style={{marginTop:8}}>{msg}</p>}
    </div>
  );
}
