import React, { useMemo, useState, useEffect } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { recordResult } from "../lib/progress";

export default function Flashcards({ pairs = [], meta }) {
  const deck = useMemo(() => (pairs || []).filter(p => p?.term && p?.def), [pairs]);

  const [i, setI] = useState(0);
  const [showDef, setShowDef] = useState(false);   // false = term (front), true = definition (back)
  const [madeMistake, setMadeMistake] = useState(false);

  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const accuracy = answered ? Math.round((score / answered) * 100) + "%" : "—";

  useEffect(() => {
    setMadeMistake(false);
    setShowDef(false); // новая карточка — снова лицевая сторона
  }, [i]);

  function next() {
    if (!deck.length) return;
    setI(n => (n + 1) % deck.length);
  }

  function flip() {
    setShowDef(v => !v);
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

      {/* Карточка с двумя поверхностями */}
      <div className="flip-outer mb-4" onClick={flip}>
        <div className={"card card-pad flip-inner " + (showDef ? "flip-rotated" : "")}>
          {/* Front (term) */}
          <div className="flip-face">
            <div className="text-xl font-semibold">{item.term}</div>
            <div className="sub mt-1">Term</div>
          </div>
          {/* Back (definition) */}
          <div className="flip-face flip-back">
            <div className="text-xl font-semibold">{item.def}</div>
            <div className="sub mt-1">Definition</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" className="btn" onClick={flip}>Flip card</button>
        <button type="button" className="btn btn-primary" onClick={know}>I knew it</button>
        <button type="button" className="btn" onClick={dontKnow}>I didn’t know</button>
      </div>

      <div className="mt-4">{meta}</div>
    </Page>
  );
}
