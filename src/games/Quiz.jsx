import React, { useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { shuffle } from "../utils";

export default function Quiz({ pairs = [], meta }) {
  const deck = useMemo(() => shuffle(pairs), [pairs]);

  const [i, setI] = useState(0);             // текущий индекс
  const [score, setScore] = useState(0);     // верных
  const [answered, setAnswered] = useState(0); // всего отвечено
  const [msg, setMsg] = useState("");
  const [flipped, setFlipped] = useState(false); // для анимации флипа
  const [locked, setLocked] = useState(false);   // чтобы не клацать варианты во время флипа

  const q = deck[i];

  const options = useMemo(() => {
    if (!q) return [];
    const others = shuffle(deck.filter(x => x.key !== q.key)).slice(0, 3).map(x => x.term);
    return shuffle([q.term, ...others]);
  }, [q, deck]);

  function nextQuestion() {
    setFlipped(false);
    setLocked(false);
    setMsg("");
    setI(n => (n + 1) % deck.length);
  }

  function pick(opt) {
    if (locked) return;
    const ok = opt === q.term;

    setLocked(true);
    setAnswered(a => a + 1);
    if (ok) setScore(s => s + 1);

    // что показать на обороте
    setMsg(ok ? "✅ Correct" : `❌ ${q.term}`);

    // запускаем флип
    setFlipped(true);

    // после короткой паузы идём дальше
    setTimeout(nextQuestion, 900);
  }

  const accuracy = answered > 0 ? Math.round((score / answered) * 100) + "%" : "—";

  return (
    <Page title="Quiz" subtitle="Choose the correct word for the definition.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Stat label="Question" value={`${i + 1}/${deck.length || 0}`} />
        <Stat label="Score" value={score} />
        <Stat label="Accuracy" value={accuracy} />
      </div>

      {/* Флип-карта */}
      <div className="perspective mb-4">
        <div
          className={
            "relative h-28 md:h-32 card card-pad text-lg transition-transform duration-500 preserve-3d " +
            (flipped ? "rotate-y-180" : "")
          }
        >
          {/* Front: definition */}
          <div className="absolute inset-0 backface-hidden flex items-center">
            {q?.def || "—"}
          </div>

          {/* Back: result */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center">
            <div className="text-base md:text-lg font-medium">{msg || "…"}</div>
            {!msg.startsWith("✅") && q?.term && (
              <div className="text-sm text-slate-500 mt-1">Correct: <b>{q.term}</b></div>
            )}
          </div>
        </div>
      </div>

      {/* Варианты ответа */}
      <div className={"grid grid-cols-1 md:grid-cols-2 gap-3 " + (locked ? "opacity-70 pointer-events-none" : "")}>
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
