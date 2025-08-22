import React, { useMemo, useState, useEffect } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { recordResult } from "../lib/progress";

export default function Flashcards({ pairs = [], meta }) {
  const deck = useMemo(() => (pairs || []).filter(p => p?.term && p?.def), [pairs]);

  const [i, setI] = useState(0);
  const [face, setFace] = useState("term"); // 'term' | 'def'
  const [flipped, setFlipped] = useState(false);
  const [madeMistake, setMadeMistake] = useState(false);

  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const accuracy = answered ? Math.round((score / answered) * 100) + "%" : "—";

  useEffect(() => {
    setMadeMistake(false);
    setFlipped(false);
    setFace("term");
  }, [i]);

  function next() {
    if (!deck.length) return;
    setI(n => (n + 1) % deck.length);
  }

  function know() {
    const term = deck[i]?.term;
    setAnswered(n => n + 1);
    setScore(s => s + 1);
    setStreak(st => st + 1);
    recordResult({ term, correct: true, firstTry: !madeMistake, game: "flashcards" });
    setTimeout(next, 350);
  }

  function dontKnow() {
    const term = deck[i]?.term;
    setAnswered(n => n + 1);
    setStreak(0);
    setMadeMistake(true);
    recordResult({ term, correct: false, firstTry: false, game: "flashcards" });
    setTimeout(next, 200);
  }

  if (!deck.length) return <div className="p-6">No data…</div>;
  const item = deck[i];

  return (
    <Page title="Flashcards" subtitle="Flip the card and rate your recall." right={null}>
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6">
        <Stat label="Card" value={`${i + 1}/${deck.length}`} />
        <Stat label="Score" value={score} />
        <Stat label="Streak" value={streak} />
        <Stat label="Accuracy" value={accuracy} />
      </div>

      <div
        className={"card card-pad mb-4 cursor-pointer transition-transform duration-300 " + (flipped ? "rotate-y-180" : "")}
        style={{ perspective: 1000 }}
        onClick={() => setFlipped(f => !f)}
      >
        <div className="text-xl font-semibold">
          {flipped ? (face === "term" ? item.def : item.term) : (face === "term" ? item.term : item.def)}
        </div>
        <div className="sub mt-1">{flipped ? (face === "term" ? "Definition" : "Term") : (face === "term" ? "Term" : "Definition")}</div>
      </div>

      <div className="flex gap-2">
        <button type="button" className="btn" onClick={() => setFace(f => (f === "term" ? "def" : "term"))}>Flip side</button>
        <button type="button" className="btn" onClick={() => setFlipped(f => !f)}>Flip card</button>
        <button type="button" className="btn btn-primary" onClick={know}>I knew it</button>
        <button type="button" className="btn" onClick={dontKnow}>I didn’t know</button>
      </div>

      <div className="mt-4">{meta}</div>
    </Page>
  );
}
