import React, { useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { shuffle } from "../utils";
import { recordResult } from "../lib/progress";

export default function Matching({ pairs = [], meta }) {
  const deck = useMemo(() => (pairs || []).filter(p => p?.term && p?.def), [pairs]);
  const left = useMemo(() => shuffle(deck.map((p, idx) => ({ id: "L"+idx, term: p.term }))), [deck]);
  const right = useMemo(() => shuffle(deck.map((p, idx) => ({ id: "R"+idx, def: p.def, term: deck[idx].term }))), [deck]);

  const [selectedL, setSelectedL] = useState(null); // {id, term}
  const [solved, setSolved] = useState(new Set());  // ids R/L solved
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakeMap, setMistakeMap] = useState(new Map()); // term -> wasMistake
  const accuracy = answered ? Math.round((score / answered) * 100) + "%" : "—";

  function pickLeft(item) {
    if (solved.has(item.id)) return;
    setSelectedL(item);
  }

  function pickRight(item) {
    if (!selectedL || solved.has(item.id)) return;

    const correct = item.term === selectedL.term;
    setAnswered(n => n + 1);

    if (correct) {
      setScore(s => s + 1);
      setStreak(st => st + 1);
      const wasMistake = mistakeMap.get(selectedL.term) === true;
      recordResult({ term: selectedL.term, correct: true, firstTry: !wasMistake, game: "matching" });

      const next = new Set(solved);
      next.add(selectedL.id);
      next.add(item.id);
      setSolved(next);

      setSelectedL(null);
      setMistakeMap(prev => {
        const m = new Map(prev);
        m.delete(selectedL.term);
        return m;
      });
    } else {
      setStreak(0);
      recordResult({ term: selectedL.term, correct: false, firstTry: false, game: "matching" });
      setMistakeMap(prev => {
        const m = new Map(prev);
        m.set(selectedL.term, true);
        return m;
      });
    }
  }

  const solvedCount = solved.size / 2;

  return (
    <Page title="Matching" subtitle="Match terms to their definitions." right={null}>
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6">
        <Stat label="Solved" value={`${solvedCount}/${deck.length}`} />
        <Stat label="Score" value={score} />
        <Stat label="Streak" value={streak} />
        <Stat label="Accuracy" value={accuracy} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Left: terms */}
        <div className="card card-pad">
          <div className="sub mb-2">Terms</div>
          <div className="flex flex-col gap-2">
            {left.map(item => (
              <button
                key={item.id}
                className={
                  "btn justify-start " +
                  (solved.has(item.id) ? "opacity-40 pointer-events-none " : "") +
                  (selectedL?.id === item.id ? "ring-2 ring-indigo-400 " : "")
                }
                onClick={() => pickLeft(item)}
              >
                {item.term}
              </button>
            ))}
          </div>
        </div>

        {/* Right: definitions */}
        <div className="card card-pad">
          <div className="sub mb-2">Definitions</div>
          <div className="flex flex-col gap-2">
            {right.map(item => (
              <button
                key={item.id}
                className={"btn justify-start " + (solved.has(item.id) ? "opacity-40 pointer-events-none " : "")}
                onClick={() => pickRight(item)}
              >
                {item.def}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">{meta}</div>
    </Page>
  );
}
