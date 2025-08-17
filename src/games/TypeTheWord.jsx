import React, { useMemo, useState } from "react";
import { shuffle } from "../utils";

function norm(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function TypeTheWord({ pairs = [] }) {
  const deck = useMemo(() => shuffle(pairs), [pairs]);
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [tries, setTries] = useState(0);
  const [message, setMessage] = useState("");

  if (!deck.length) return <p>No data.</p>;
  const q = deck[i];

  function check() {
    const ok = norm(value) === norm(q.term);
    if (ok) {
      setScore(s => s + 1);
      setStreak(st => st + 1);
      setMessage("✅ Correct");
      setTimeout(() => {
        setI(n => (n + 1) % deck.length);
        setValue(""); setTries(0); setMessage("");
      }, 600);
    } else {
      setStreak(0);
      setTries(t => t + 1);
      setMessage("❌ Try again");
    }
  }

  function hint() {
    const n = Math.min(1 + tries, q.term.length);
    setValue(q.term.slice(0, n));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">Question {i + 1} / {deck.length}</div>
        <div className="text-sm text-slate-500">Score: {score} · Streak: {streak}</div>
      </div>
      <div className="rounded-2xl border bg-white shadow p-6 text-lg">{q.def}</div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') check(); }}
          placeholder="Type the word…"
          className="flex-1 rounded-xl border p-3 bg-white shadow outline-none"
        />
        <button onClick={check} className="px-4 py-3 rounded-xl bg-indigo-600 text-white shadow">Check</button>
      </div>
      <div className="flex gap-2">
        <button onClick={hint} className="px-3 py-2 rounded-xl border bg-white shadow">Hint</button>
        <button onClick={() => setValue(q.term)} className="px-3 py-2 rounded-xl border bg-white shadow">Reveal</button>
        <button onClick={() => { setI(n => (n + 1) % deck.length); setValue(""); setTries(0); setMessage(""); }} className="px-3 py-2 rounded-xl border bg-white shadow">Skip</button>
      </div>
      {message && <div className="text-center text-sm">{message}</div>}
    </div>
  );
}
