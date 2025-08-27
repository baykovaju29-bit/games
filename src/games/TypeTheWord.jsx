import React, { useMemo, useState, useEffect } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { recordResult } from "../lib/progress";

export default function TypeTheWord({ pairs = [], meta }) {
  const deck = useMemo(() => (pairs || []).filter(p => p?.term && p?.def), [pairs]);
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [madeMistake, setMadeMistake] = useState(false);
  const [msg, setMsg] = useState("");

  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const accuracy = answered ? Math.round((score / answered) * 100) + "%" : "—";

  useEffect(() => { setMadeMistake(false); setValue(""); setMsg(""); }, [i]);

  if (!deck.length) return <div className="p-6">No data…</div>;
  const item = deck[i];

  function check() {
    const correct = value.trim().toLowerCase() === item.term.trim().toLowerCase();
    setAnswered(n => n + 1);
    if (correct) {
      setScore(s => s + 1);
      setStreak(st => st + 1);
      setMsg("✅ Correct");
      recordResult({ term: item.term, correct: true, firstTry: !madeMistake, game: "type" });
      setTimeout(() => setI(n => (n + 1) % deck.length), 500);
    } else {
      setStreak(0);
      setMadeMistake(true);
      setMsg("❌ Try again");
      recordResult({ term: item.term, correct: false, firstTry: false, game: "type" });
    }
  }

  return (
    <Page title="Type the Word" subtitle="Type the word for the definition." right={null}>
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6">
        <Stat label="Item" value={`${i + 1}/${deck.length}`} />
        <Stat label="Score" value={score} />
        <Stat label="Streak" value={streak} />
        <Stat label="Accuracy" value={accuracy} />
      </div>

      <div className="card card-pad mb-3 text-lg">{item.def}</div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          className="flex-1 card px-3 py-2 outline-none"
          placeholder="Type here…"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && check()}
        />
        <div className="flex gap-2">
          <button type="button" className="btn" onClick={() => setI(n => (n + 1) % deck.length)}>Skip</button>
          <button type="button" className="btn btn-primary" onClick={check} disabled={!value.trim()}>Check</button>
        </div>
      </div>

      {msg && <div className="text-center mt-2 sub">{msg}</div>}
      <div className="mt-4">{meta}</div>
    </Page>
  );
}
