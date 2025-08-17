import React, { useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { shuffle } from "../utils";

const norm = s => (s||"").toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/\s+/g," ").trim();

export default function TypeTheWord({ pairs=[], meta }) {
  const deck = useMemo(()=>shuffle(pairs), [pairs]);
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState("");
  const q = deck[i];

  function check(){
    if (!q) return;
    if (norm(val)===norm(q.term)) {
      setScore(s=>s+1); setStreak(st=>st+1); setMsg("✅ Correct");
      setTimeout(()=>{ setI(n=>(n+1)%deck.length); setVal(""); setTries(0); setMsg(""); }, 700);
    } else { setStreak(0); setTries(t=>t+1); setMsg("❌ Try again"); }
  }
  function hint(){ if(q){ const n=Math.min(1+tries, q.term.length); setVal(q.term.slice(0,n)); } }

  return (
    <Page title="Type the Word" subtitle="Type the missing word from the definition.">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Question" value={`${i+1}/${deck.length||0}`}/>
        <Stat label="Score" value={score}/>
        <Stat label="Streak" value={streak}/>
        <Stat label="Tries" value={tries}/>
      </div>

      <div className="card card-pad text-lg mb-4">{q?.def || "—"}</div>

      <div className="flex gap-2">
        <input
          value={val}
          onChange={e=>setVal(e.target.value)}
          onKeyDown={e=>e.key==="Enter" && check()}
          placeholder="Type the word…"
          className="flex-1 card px-3 py-2 outline-none"
        />
        <button onClick={check} className="btn btn-primary">Check</button>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={hint} className="btn">Hint</button>
        <button onClick={()=>setVal(q?.term||"")} className="btn">Reveal</button>
        <button onClick={()=>{ setI(n=>(n+1)%deck.length); setVal(""); setTries(0); setMsg(""); }} className="btn">Skip</button>
      </div>

      {msg && <div className="text-center mt-3 sub">{msg}</div>}

      <div className="mt-4">{meta}</div>
    </Page>
  );
}
