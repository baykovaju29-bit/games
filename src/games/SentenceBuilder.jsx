import React, { useEffect, useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { shuffle } from "../utils";

// --- Токенизация (убираем финальную точку/знак, разбиваем на слова) ---
function tokenize(sentence) {
  const cleaned = (sentence || "")
    .trim()
    .replace(/[.?!…]+$/u, ""); 
  const parts = cleaned.split(/\s+/);
  return parts.map((t, idx) => ({ t, id: `${idx}:${t}` }));
}

function normalizeTokens(tokens) {
  return tokens
    .map((x) => x.t)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export default function SentenceBuilder({ meta, pairs = [] }) {
  const [deck, setDeck] = useState([]);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [message, setMessage] = useState("");

  const [wrongPulse, setWrongPulse] = useState(false);
  const [okFlash, setOkFlash] = useState(false);

  // Ранее мы грузили /data.csv. Убираем выборку, оставляем пустой deck по умолчанию.
  useEffect(() => {
    setDeck([]);
  }, []);

  // Текущее предложение
  const current = deck[i] || {};
  const targetTokens = useMemo(() => tokenize(current.sentence || ""), [current]);

  // Лоток = перемешанные токены минус выбранные
  const tray = useMemo(() => {
    const shuffled = shuffle(targetTokens);
    const used = new Set(answer.map((x) => x.id));
    return shuffled.filter((x) => !used.has(x.id));
  }, [targetTokens, answer]);

  function pick(tokenObj) {
    setAnswer((a) => [...a, tokenObj]);
  }
  function undo(idx) {
    setAnswer((a) => a.filter((_, j) => j !== idx));
  }

  function resetCurrent() {
    setAnswer([]);
    setMessage("");
    setWrongPulse(false);
    setOkFlash(false);
  }

  function next() {
    if (deck.length === 0) return;
    setI(Math.floor(Math.random() * deck.length));
    resetCurrent();
  }

  function check() {
    const ok =
      normalizeTokens(answer) === normalizeTokens(targetTokens);

    setAnswered((n) => n + 1);

    if (ok) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      setMessage("✅ Correct!");

      setOkFlash(true);
      setTimeout(() => setOkFlash(false), 600);
      setTimeout(() => next(), 700);
    } else {
      setStreak(0);
      setMessage("❌ Try again");

      setWrongPulse(true);
      setTimeout(() => {
        setWrongPulse(false);
        setAnswer([]);
      }, 350);
    }
  }

  const accuracy =
    answered > 0 ? Math.round((score / answered) * 100) + "%" : "—";

  if (deck.length === 0) {
    return <div className="p-6">No sentence dataset configured.</div>;
  }

  return (
    <Page
      title="Sentence Builder"
      subtitle="Tap words in order to build a correct sentence. (No dot at the end needed)"
      right={null}
    >
      {/* Статы */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6">
        <Stat label="Sentence" value={`${i + 1}/${deck.length}`} />
        <Stat label="Score" value={score} />
        <Stat label="Streak" value={streak} />
        <Stat label="Accuracy" value={accuracy} />
      </div>

      {/* Показ времени */}
      <div className="card card-pad sub mb-3">
        <strong>Tense:</strong> {current.tense}
      </div>

      {/* Ответ игрока */}
      <div className={"card card-pad mb-4 " + (wrongPulse ? "animate-shake" : "")}>
        <div className="sub mb-2">Your sentence</div>
        <div className="flex flex-wrap gap-2">
          {answer.length === 0 && (
            <span className="text-slate-400">Tap tiles below…</span>
          )}
          {answer.map((x, idx) => (
            <button
              key={"a" + x.id + idx}
              onClick={() => undo(idx)}
              className={
                "btn " +
                (wrongPulse ? "bg-rose-50 border-rose-200" : "")
              }
            >
              {x.t}
            </button>
          ))}
        </div>
      </div>

      {/* Лоток + кнопки справа */}
      <div className="flex gap-4">
        <div className="card card-pad flex-1">
          <div className="sub mb-2">Tiles</div>
          <div className="flex flex-wrap gap-2">
            {tray.map((x) => (
              <button
                key={x.id}
                onClick={() => pick(x)}
                className="btn"
              >
                {x.t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 w-28">
          <button className="btn" onClick={resetCurrent}>Reset</button>
          <button
            className={"btn btn-primary " + (okFlash ? "flash-success" : "")}
            onClick={check}
            disabled={answer.length === 0}
          >
            Check
          </button>
          <button className="btn" onClick={next}>Skip</button>
        </div>
      </div>

      {message && <div className="text-center mt-3 sub">{message}</div>}
      <div className="mt-4">{meta}</div>
    </Page>
  );
}
