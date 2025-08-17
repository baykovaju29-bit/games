import React, { useState } from "react";
export default function TypeTheWord({ pairs }) {
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [msg, setMsg] = useState("");
  const q = pairs[i % pairs.length];
  function norm(s){ return (s||"").toLowerCase().trim(); }
  function check(){
    if(norm(val)===norm(q.term)){ setMsg("✅ Correct"); setTimeout(()=>{ setI(i+1); setVal(""); setMsg(""); }, 600); }
    else setMsg("❌ Try again");
  }
  return (
    <div>
      <div style={{padding:12, border:"1px solid #ccc", marginBottom:8}}>{q.def}</div>
      <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="Type the word"/>
      <button onClick={check}>Check</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}
