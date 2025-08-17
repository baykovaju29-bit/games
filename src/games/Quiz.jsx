import React, { useMemo, useState } from "react";
export default function Quiz({ pairs }) {
  const [i, setI] = useState(0);
  const q = pairs[i % pairs.length];
  const options = useMemo(() => {
    const others = pairs.filter(p=>p.term!==q.term).slice(0,3).map(p=>p.term);
    return shuffle([q.term, ...others]);
  }, [i, pairs]);
  const [msg, setMsg] = useState("");
  function pick(opt){
    setMsg(opt===q.term ? "✅ Correct" : `❌ ${q.term}`);
    setTimeout(()=>{ setI(i+1); setMsg(""); }, 600);
  }
  return (
    <div>
      <div style={{padding:12, border:"1px solid #ccc", marginBottom:8}}>{q.def}</div>
      {options.map(o=><div key={o}><button onClick={()=>pick(o)}>{o}</button></div>)}
      {msg && <p>{msg}</p>}
    </div>
  );
}
function shuffle(a){ const c=[...a]; for(let i=c.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [c[i],c[j]]=[c[j],c[i]];} return c; }
