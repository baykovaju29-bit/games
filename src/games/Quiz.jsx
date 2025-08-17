import React, { useMemo, useState } from "react";
import { shuffle } from "../utils";

export default function Quiz({ pairs = [] }) {
  const deck = useMemo(() => shuffle(pairs), [pairs]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState("");

  if (!deck.length) return <p>No data.</p>;

  const q = deck[i];
  const options = useMemo(() => {
    const others = shuffle(deck.filter(x => x.key !== q.key)).slice(0, 3).map(x => x.term);
    return shuffle([q.term, ...others]);
  }, [q, deck]);

  function pick(opt) {
    const ok = opt === q.term;
    if (ok) { setScore(s => s + 1); setMsg("✅ Correct"); }
    else    { setMsg(`❌ ${q.term}`); }
    setTimeout(() => { setMsg(""); setI(n => (n + 1) % deck.length); }, 600);
  }

  return (
    <div>
      <p>Question {i + 1}/{deck.length} · Score: {score}</p>
      <div style={{padding:12, border:"1px solid #ddd", marginBottom:8, background:"#fff"}}>{q.def}</div>
      <div style={{display:"grid", gap:8}}>
        {options.map((opt) => (
          <button key={opt} onClick={() => pick(opt)} style={{textAlign:"left", padding:"10px 12px", border:"1px solid #ddd"}}>
            {opt}
          </button>
        ))}
      </div>
      {msg && <p style={{marginTop:8}}>{msg}</p>}
    </div>
  );
}
