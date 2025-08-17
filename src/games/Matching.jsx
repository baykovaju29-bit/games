import React, { useEffect, useState } from "react";
import { shuffle } from "../utils";

export default function Matching({ pairs = [] }) {
  const [round, setRound] = useState(() => shuffle(pairs));
  const [left, setLeft]   = useState(() => shuffle(round).map(p => ({...p, id: rnd()})));
  const [right, setRight] = useState(() => shuffle(round).map(p => ({...p, id: rnd()})));
  const [matched, setMatched] = useState({});
  const [selLeft, setSelLeft] = useState(null);
  const [selRight, setSelRight] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const r = shuffle(pairs);
    setRound(r);
    setLeft(shuffle(r).map(p => ({...p, id: rnd()})));
    setRight(shuffle(r).map(p => ({...p, id: rnd()})));
    setMatched({}); setSelLeft(null); setSelRight(null);
    setScore(0); setMistakes(0); setStreak(0);
  }, [pairs]);

  useEffect(() => {
    if (selLeft && selRight) {
      const ok = selLeft.key === selRight.key;
      if (ok) {
        setMatched(m => ({...m, [selLeft.key]: true}));
        setScore(s => s + 100 + streak * 10);
        setStreak(st => st + 1);
      } else {
        setMistakes(x => x + 1);
        setStreak(0);
      }
      setSelLeft(null); setSelRight(null);
    }
  }, [selLeft, selRight]);

  const finished = Object.keys(matched).length >= round.length && round.length > 0;

  return (
    <div>
      <p>Score: <b>{score}</b> · Streak: {streak} · Mistakes: {mistakes} · Pairs: {Object.keys(matched).length}/{round.length}</p>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
        <Column title="Words" items={left}  matched={matched} selected={selLeft}  setSelected={setSelLeft}  side="left" />
        <Column title="Definitions" items={right} matched={matched} selected={selRight} setSelected={setSelRight} side="right" />
      </div>
      {finished && (
        <div style={{marginTop:12, padding:12, border:"1px solid #a3e635", background:"#ecfccb"}}>
          🎉 Great job! Score {score} · Mistakes {mistakes}
          <div style={{marginTop:8}}>
            <button onClick={() => setRound(shuffle(pairs))}>Play again</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Column({ title, items, matched, selected, setSelected, side }) {
  return (
    <div>
      <h3 style={{margin:"6px 0"}}>{title}</h3>
      <div style={{display:"grid", gap:8}}>
        {items.map((it, idx) => {
          const isMatched = !!matched[it.key];
          const isSelected = selected?.id === it.id;
          return (
            <button
              key={it.id}
              disabled={isMatched}
              onClick={() => setSelected(isSelected ? null : it)}
              style={{
                textAlign:"left", padding:"10px 12px", border:"1px solid #ddd",
                background: isMatched ? "#ecfdf5" : isSelected ? "#4338ca" : "#fff",
                color: isSelected ? "#fff" : "#000"
              }}
            >
              <span style={{opacity:.6, marginRight:8}}>{idx+1}.</span>
              {side === "left" ? it.term : it.def}
            </button>
          );
        })}
      </div>
    </div>
  );
}
function rnd(){ return Math.random().toString(36).slice(2,9); }
