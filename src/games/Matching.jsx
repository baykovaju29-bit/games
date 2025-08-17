import React, { useEffect, useState } from "react";
import { shuffle } from "../utils";

export default function MatchingGame({ pairs = [] }) {
  const [round, setRound] = useState(() => shuffle(pairs));
  const [left, setLeft] = useState(() => shuffle(round).map(p => ({...p, id: Math.random().toString(36).slice(2,9)})));
  const [right, setRight] = useState(() => shuffle(round).map(p => ({...p, id: Math.random().toString(36).slice(2,9)})));
  const [matched, setMatched] = useState({});
  const [selLeft, setSelLeft] = useState(null);
  const [selRight, setSelRight] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const r = shuffle(pairs);
    setRound(r);
    setLeft(shuffle(r).map(p => ({...p, id: Math.random().toString(36).slice(2,9)})));
    setRight(shuffle(r).map(p => ({...p, id: Math.random().toString(36).slice(2,9)})));
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Stat label="Score" value={score} />
        <Stat label="Streak" value={streak} />
        <Stat label="Mistakes" value={mistakes} />
        <Stat label="Pairs" value={`${Object.keys(matched).length}/${round.length}`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Column title="Words" items={left} matched={matched} selected={selLeft} setSelected={setSelLeft} side="left" />
        <Column title="Definitions" items={right} matched={matched} selected={selRight} setSelected={setSelRight} side="right" />
      </div>
      {finished && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="font-semibold">🎉 Great job! You matched all pairs.</p>
            <p className="text-sm">Score: {score} · Mistakes: {mistakes}</p>
          </div>
          <button onClick={() => setRound(shuffle(pairs))} className="px-3 py-2 rounded-xl bg-white shadow border">Play again</button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border shadow p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function Column({ title, items, matched, selected, setSelected, side }) {
  return (
    <div className="bg-white border rounded-2xl shadow p-4">
      <h2 className="font-semibold mb-3">{title}</h2>
      <div className="grid grid-cols-1 gap-2">
        {items.map((it, idx) => {
          const isMatched = !!matched[it.key];
          const isSelected = selected?.id === it.id;
          return (
            <button
              key={it.id}
              disabled={isMatched}
              onClick={() => setSelected(isSelected ? null : it)}
              className={
                "text-left w-full px-3 py-3 rounded-xl border shadow-sm transition active:scale-[0.99] " +
                (isMatched
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : isSelected
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white hover:bg-slate-50")
              }
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-mono rounded-full bg-slate-100 border">{idx + 1}</span>
                <span>{side === "left" ? it.term : it.def}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
