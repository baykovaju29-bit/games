import React, { useEffect, useState } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { shuffle } from "../utils";

export default function Matching({ pairs=[], meta }) {
  const [round, setRound] = useState(()=>shuffle(pairs));
  const [left,  setLeft ] = useState(()=>shuffle(round).map(p=>({...p, id:rnd()})));
  const [right, setRight] = useState(()=>shuffle(round).map(p=>({...p, id:rnd()})));
  const [matched, setMatched] = useState({});
  const [selLeft, setSelLeft] = useState(null);
  const [selRight,setSelRight]= useState(null);
  const [score,   setScore]   = useState(0);
  const [mistakes,setMistakes]= useState(0);
  const [streak,  setStreak]  = useState(0);

  useEffect(()=> {
    const r = shuffle(pairs);
    setRound(r);
    setLeft (shuffle(r).map(p=>({...p, id:rnd()})));
    setRight(shuffle(r).map(p=>({...p, id:rnd()})));
    setMatched({}); setSelLeft(null); setSelRight(null);
    setScore(0); setMistakes(0); setStreak(0);
  }, [pairs]);

  useEffect(()=> {
    if (selLeft && selRight) {
      const ok = selLeft.key === selRight.key;
      if (ok) { setMatched(m=>({...m,[selLeft.key]:true})); setScore(s=>s+100+streak*10); setStreak(st=>st+1); }
      else    { setMistakes(x=>x+1); setStreak(0); }
      setSelLeft(null); setSelRight(null);
    }
  }, [selLeft, selRight]);

  const finished = round.length>0 && Object.keys(matched).length===round.length;

  return (
    <Page
      title="Matching Game: Words ↔ Definitions"
      subtitle="Click a word, then a definition to make a pair."
      right={
        <div className="flex gap-2">
          <button className="btn" onClick={()=>{ setMatched({}); setSelLeft(null); setSelRight(null); setScore(0); setMistakes(0); setStreak(0); }}>
            Reset
          </button>
          <button className="btn btn-primary" onClick={()=>setRound(shuffle(pairs))}>
            New Round
          </button>
        </div>
      }
    >
            {/* Статистика: на мобилке 4 в ряд, компактный вид */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6">
        <Stat label="Score"    value={score} />
        <Stat label="Streak"   value={streak} />
        <Stat label="Mistakes" value={mistakes} />
        <Stat label="Pairs"    value={`${Object.keys(matched).length}/${round.length}`} />
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Column title="Words" items={left}  selected={selLeft}  setSelected={setSelLeft}  matched={matched} side="left"/>
        <Column title="Definitions" items={right} selected={selRight} setSelected={setSelRight} matched={matched} side="right"/>
      </div>

      {finished && (
        <div className="card card-pad mt-6 border-emerald-200 bg-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">🎉 Great job! You matched all pairs.</p>
              <p className="sub">Score: {score} · Mistakes: {mistakes}</p>
            </div>
            <button className="btn" onClick={()=>setRound(shuffle(pairs))}>Play again</button>
          </div>
        </div>
      )}

      <div className="mt-4">{meta}</div>
    </Page>
  );
}

function Column({ title, items, matched, selected, setSelected, side }) {
  return (
    <div className="card">
      <div className="card-pad">
        <h3 className="font-semibold mb-3">{title}</h3>
        <div className="grid gap-2">
          {items.map((it, idx)=>{
            const isMatched = !!matched[it.key];
            const isSel = selected?.id===it.id;
            return (
              <button key={it.id} disabled={isMatched}
                onClick={()=>setSelected(isSel?null:it)}
                className={
                  "w-full text-left px-3 py-3 rounded-xl border shadow-sm transition active:scale-[0.99] " +
                  (isMatched
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : isSel
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white hover:bg-slate-50")
                }>
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-mono rounded-full bg-slate-100 border">{idx+1}</span>
                  <span>{side==="left" ? it.term : it.def}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
const rnd = () => Math.random().toString(36).slice(2,9);
