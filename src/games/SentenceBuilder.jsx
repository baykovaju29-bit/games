import React, { useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { shuffle } from "../utils";

// Примеры по умолчанию
const SAMPLE = [
  "Yesterday I went to the park.",
  "She has already finished her homework.",
  "We are going to visit our grandparents next weekend.",
  "If it rains, we will stay at home.",
  "He was reading a book when I called.",
  "The film had already started when we arrived.",
  "Coffee is grown in many countries.",
  "I wish I had more free time.",
];

// --- Токенизация ---
function tokenize(sentence) {
  const cleaned = (sentence || "")
    .trim()
    .replace(/[.?!…]+$/u, ""); // УДАЛЯЕМ конечный знак
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

export default function SentenceBuilder({ items = SAMPLE, meta }) {
  const deck = useMemo(() => items.filter(Boolean), [items]);

  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [message, setMessage] = useState("");

  const [wrongPulse, setWrongPulse] = useState(false);  // красная подсветка/тряска при ошибке
  const [okFlash, setOkFlash] = useState(false);        // зелёная вспышка на Check

  const target = deck[i] || "";
  const targetTokens = useMemo(() => tokenize(target), [target]);

  // Лоток = перемешанные целевые токены минус уже выбранные
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
    setI((n) => (n + 1) % deck.length);
    resetCurrent();
  }

  function check() {
    const ok = normalizeTokens(answer) === normalizeTokens(targetTokens);
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
        setAnswer([]); // вернуть фишки в лоток
      }, 350);
    }
  }

  const accuracy = answered > 0 ? Math.round((score / answered) * 100) + "%" : "—";

  return (
    <Page
      title="Sentence Builder"
      subtitle="Tap words in order to build a correct sentence. (No dot at the end needed)"
      // убрали верхние кнопки — теперь они стоят справа от Tiles
    >
      {/* Статы: 4 в ряд на мобилке */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6">
        <Stat label="Sentence" value={`${i + 1}/${deck.length}`} />
        <Stat label="Score" value={score} />
        <Stat label="Streak" value={streak} />
        <Stat label="Accuracy" value={accuracy} />
      </div>

      {/* Подсказка над рабочей зоной */}
      <div className="card card-pad sub mb-3">
        Arrange the shuffled tiles to form a correct sentence.
      </div>

      {/* Рабочая зона: Tiles (уменьшено) + вертикальный столбец кнопок справа */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* LEFT: ответ игрока */}
        <div className={"card card-pad mb-1 md:mb-0 " + (wrongPulse ? "animate-shake" : "")}>
          <div className="sub mb-2">Your sentence</div>
          <div className="flex flex-wrap gap-2">
            {answer.length === 0 && (
              <span className="text-slate-400">Tap tiles below…</span>
            )}
            {answer.map((x, idx) => (
              <button
                key={"a" + x.id + idx}
                onClick={() => undo(idx)}
                className={"btn " + (wrongPulse ? "bg-rose-50 border-rose-200" : "")}
                title="Remove this token"
              >
                {x.t}
              </button>
            ))}
          </div>
        </div>

        {/* MIDDLE: Tiles — уменьшили ширину до 2/3 всего ряда (занимает 1 колонку из 2 левых) */}
        <div className="card card-pad md:col-span-1">
          <div className="sub mb-2">Tiles</div>
          <div className="flex flex-wrap gap-2">
            {tray.map((x) => (
              <button
                key={x.id}
                onClick={() => pick(x)}
                className="btn"
                title="Add token"
              >
                {x.t}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: вертикальная панель с кнопками */}
        <div className="card card-pad flex items-stretch">
          <div className="flex flex-col gap-2 w-full">
            <button className="btn w-full" onClick={resetCurrent}>
              🔄 Reset
            </button>
            <button
              className={"btn btn-primary w-full " + (okFlash ? "flash-success" : "")}
              onClick={check}
              disabled={answer.length === 0}
            >
              ✅ Check
            </button>
            <button className="btn w-full" onClick={next}>
              ⏭️ Skip
            </button>
          </div>
        </div>
      </div>

      {message && <div className="text-center mt-3 sub">{message}</div>}
      <div className="mt-4">{meta}</div>
    </Page>
  );
}
