import React, { useMemo, useState, useEffect } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { shuffle } from "../utils";
import { recordResult } from "../lib/progress";

function buildQuestions(pairs) {
  const base = (pairs || []).filter(p => p?.term && p?.def);
  const qs = base.map(p => {
    const wrongs = shuffle(base.filter(x => x.term !== p.term)).slice(0, 3).map(x => x.term);
    const options = shuffle([p.term, ...wrongs]);
    return { prompt: p.def, term: p.term, options };
  });
  return shuffle(qs);
}

export default function Quiz({ pairs = [], meta }) {
  const questions = useMemo(() => buildQuestions(pairs), [pairs]);
  const [q, setQ] = useState(0);
  const [madeMistake, setMadeMistake] = useState(false);

  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const accuracy = answered ? Math.round((score / answered) * 100) + "%" : "—";

  useEffect(() => { setMadeMistake(false); }, [q]);

  if (!questions.length) return <div className="p-6">No data…</div>;
  const curr = questions[q];

  function choose(opt) {
    const correct = opt === curr.term;
    setAnswered(n => n + 1);
    if (correct) {
      setScore(s => s + 1);
      setStreak(st => st + 1);
    } else {
      setStreak(0);
      setMadeMistake(true);
    }
    recordResult({ term: curr.term, correct, firstTry: correct && !madeMistake, game: "quiz" });
    setTimeout(() => setQ(n => (n + 1) % questions.length), 350);
  }

  return (
    <Page title="Quiz" subtitle="Choose the correct word for the definition." right={null}>
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6">
        <Stat label="Question" value={`${q + 1}/${questions.length}`} />
        <Stat label="Score" value={score} />
        <Stat label="Streak" value={streak} />
        <Stat label="Accuracy" value={accuracy} />
      </div>

      <div className="card card-pad mb-4 text-lg">{curr.prompt}</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {curr.options.map(opt => (
          <button type="button" key={opt} className="btn" onClick={() => choose(opt)}>
            {opt}
          </button>
        ))}
      </div>

      <div className="mt-4">{meta}</div>
    </Page>
  );
}
