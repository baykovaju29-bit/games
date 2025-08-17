import React, { useMemo, useState } from "react";
import { shuffle } from "../utils";

export default function Quiz({ pairs }) {
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
    if (ok) {
      setScore(s => s + 1);
      setMsg("✅ Correct");
    } else {
      setMsg(`❌ ${q.term}`);
    }
    setTimeout(() => {
      setMsg("");
      setI(n => (n + 1) % deck.length);
    }, 600);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">Question {i + 1} / {deck.length}</div>
        <div className="text-sm text-slate-500">Score: {score}</div>
      </div>
      <div className="rounded-2xl border bg-white shadow p-6 text-lg">{q.def}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt) => (
          <button key={opt} onClick={() => pick(opt)} className="px-3 py-3 rounded-xl border bg-white shadow text-left active:scale-[0.99]">
            {opt}
          </button>
        ))}
      </div>
      {msg && <div className="text-center text-sm">{msg}</div>}
    </div>
  );
}
