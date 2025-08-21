import React, { useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { shuffle } from "../utils";

export default function FillTheGap({ pairs = [], meta }) {
  const deck = useMemo(() => shuffle(pairs), [pairs]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [msg, setMsg] = useState("");

  const q = deck[i];

  const options = useMemo(() => {
    if (!q) return [];
    const others = shuffle(deck.filter(x => x.key !== q.key)).slice(0, 3).map(x => x.term);
    return shuffle([q.term, ...others]);
  }, [q, deck]);

  function pick(opt) {
    const ok = opt === q.term;
    setAnswered(a => a + 1);
    if (ok) setScore(s => s + 1);
    setMsg(ok ? "✅ Correct" : `❌ ${q.term}`);
    setTimeout(() => {
      setMsg("");
      setI(n => (n + 1) % deck.length);
    }, 700);
  }

  const accuracy = answered > 0 ? Math.round((score / answered) * 100) + "%" : "—";

  return (
    <Page title="Fill the Gap" subtitle="Choose the correct word to complete the sentence.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Stat label="Question" value={`${i + 1}/${deck.length || 0}`} />
        <Stat label="Score" value={score} />
        <Stat label="Accuracy" value={accuracy} />
      </div>

      <div className="card card-pad text-lg mb-4">{q?.def || "—"}</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt) => (
          <button key={opt} onClick={() => pick(opt)} className="btn text-left">
            {opt}
          </button>
        ))}
      </div>

      {msg && <div className="text-center mt-3 sub">{msg}</div>}
      <div className="mt-4">{meta}</div>
    </Page>
  );
}
