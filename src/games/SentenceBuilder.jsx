import React, { useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { shuffle } from "../utils";

// Если не передать props.items, возьмём встроенные примеры
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

function tokenize(sentence) {
  // Разбиваем на слова и знаки препинания так, чтобы точка была отдельной «фишкой»
  const tokens = sentence
    .replace(/\s+/g, " ")
    .trim()
    .split(/(\.|,|;|:|\?|\!)/)
    .filter(Boolean)
    .flatMap((t) => (/\w/.test(t) ? t.split(" ") : [t]));
  return tokens;
}

function normalize(arr) {
  // для сравнения игнорируем множественные пробелы и регистр, но НЕ меняем порядок/знаки
  return arr.join(" ").replace(/\s+/g, " ").trim().toLowerCase();
}

export default function SentenceBuilder({ items = SAMPLE, meta }) {
  const deck = useMemo(() => items.filter(Boolean), [items]);

  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [message, setMessage] = useState("");

  const target = deck[i] || "";
  const targetTokens = useMemo(() => tokenize(target), [target]);

  // доступные фишки = перемешанные, за вычетом уже выбранных
  const tray = useMemo(() => {
    const shuffled = shuffle(targetTokens.map((t, idx) => ({ t, id: idx + ":" + t })));
    const usedIds = new Set(answer.map((x) => x.id));
    return shuffled.filter((x) => !usedIds.has(x.id));
  }, [targetTokens, answer]);

  function pick(tokenObj) {
    setAnswer((a) => [...a, tokenObj]);
  }
  function undo(idx) {
    // щелчок по фишке в ответе — вернуть её обратно в лоток
    setAnswer((a) => a.filter((_, j) => j !== idx));
  }

  function check() {
    const user = answer.map((x) => x.t);
    const ok = normalize(user) === normalize(targetTokens);
    setAnswered((n) => n + 1);
    if (ok) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      setMessage("✅ Correct!");
      setTimeout(() => next(), 700);
    } else {
      setStreak(0);
      setMessage("❌ Try again");
    }
  }

  function resetCurrent() {
    setAnswer([]);
    setMessage("");
  }

  function next() {
    setI((n) => (n + 1) % deck.length);
    setAnswer([]);
    setMessage("");
  }

  const accuracy = answered > 0 ? Math.round((score / answered) * 100) + "%" : "—";

  return (
    <Page
      title="Sentence Builder"
      subtitle="Tap words in order to build a correct sentence."
      right={
        <div className="flex gap-2">
          <button className="btn" onClick={resetCurrent}>Reset</button>
          <button className="btn btn-primary" onClick={next}>Next</button>
        </div>
      }
    >
      {/* Статы: 4 в ряд даже на телефоне */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6">
        <Stat label="Sentence" value={`${i + 1}/${deck.length}`} />
        <Stat label="Score" value={score} />
        <Stat label="Streak" value={streak} />
        <Stat label="Accuracy" value={accuracy} />
      </div>

      {/* Целевая подсказка (не показываем полный ответ, только количество токенов) */}
      <div className="card card-pad sub mb-3">
        Arrange the shuffled tiles to form a correct sentence.
      </div>

      {/* Ответ игрока */}
      <div className="card card-pad mb-4">
        <div className="sub mb-2">Your sentence</div>
        <div className="flex flex-wrap gap-2">
          {answer.length === 0 && (
            <span className="text-slate-400">Tap tiles below…</span>
          )}
          {answer.map((x, idx) => (
            <button
              key={"a" + x.id + idx}
              onClick={() => undo(idx)}
              className="btn"
              title="Remove this token"
            >
              {x.t}
            </button>
          ))}
        </div>
      </div>

      {/* Лоток с фишками */}
      <div className="card card-pad">
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

      {/* Кнопки проверки */}
      <div className="mt-4 flex gap-2 justify-center">
        <button className="btn btn-primary" onClick={check} disabled={answer.length === 0}>
          Check
        </button>
        <button className="btn" onClick={resetCurrent}>Clear</button>
        <button className="btn" onClick={next}>Skip</button>
      </div>

      {message && <div className="text-center mt-3 sub">{message}</div>}

      <div className="mt-4">{meta}</div>
    </Page>
  );
}
