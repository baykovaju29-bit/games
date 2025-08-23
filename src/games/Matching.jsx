// src/games/Matching.jsx
import React, { useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { shuffle } from "../utils";
import { recordResult } from "../lib/progress";

export default function Matching({ pairs = [], meta }) {
  // Колода
  const deck = useMemo(
    () => (pairs || []).filter((p) => p?.term && p?.def),
    [pairs]
  );

  // Левая/правая колонка (перемешанные)
  const left = useMemo(
    () => shuffle(deck.map((p, idx) => ({ id: "L" + idx, term: p.term }))),
    [deck]
  );
  const right = useMemo(
    () =>
      shuffle(
        deck.map((p, idx) => ({
          id: "R" + idx,
          def: p.def,
          term: p.term, // храним term, чтобы проверять совпадение
        }))
      ),
    [deck]
  );

  // --- Состояние игры ---
  const [selected, setSelected] = useState(null); // { side:'L'|'R', item }
  const [solvedTerms, setSolvedTerms] = useState(new Set()); // какие term уже решены (зелёные)
  const [wasMistakeTerms, setWasMistakeTerms] = useState(new Set()); // на каких term уже была ошибка (для firstTry=false)
  const [wrongIds, setWrongIds] = useState(new Set()); // именно эти 2 id подсветить красным
  const [shake, setShake] = useState(false);

  // Статы
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const accuracy = answered ? Math.round((score / answered) * 100) + "%" : "—";
  const solvedCount = solvedTerms.size;

  function clearWrongFX() {
    setWrongIds(new Set());
    setShake(false);
  }

  function handlePick(side, item) {
    // Нажатия по уже решённому термину игнорируем
    if (solvedTerms.has(item.term)) return;

    if (!selected) {
      setSelected({ side, item });
      return;
    }

    // Если кликнули по той же стороне — просто заменим выбор
    if (selected.side === side) {
      setSelected({ side, item });
      return;
    }

    // Проверяем пару
    const leftItem  = selected.side === "L" ? selected.item : item;
    const rightItem = selected.side === "L" ? item : selected.item;
    const isCorrect = leftItem.term === rightItem.term;

    setAnswered((n) => n + 1);

    if (isCorrect) {
      // верный ответ
      setScore((s) => s + 1);
      setStreak((st) => st + 1);

      const thisTerm = leftItem.term;
      const firstTry = !wasMistakeTerms.has(thisTerm);
      recordResult({ term: thisTerm, correct: true, firstTry, game: "matching" });

      setSolvedTerms((prev) => {
        const next = new Set(prev);
        next.add(thisTerm);
        return next;
      });

      // убираем метку «была ошибка» для этого термина
      setWasMistakeTerms((prev) => {
        const next = new Set(prev);
        next.delete(thisTerm);
        return next;
      });

      setSelected(null);
      clearWrongFX();
    } else {
      // ошибка: подсветим ИМЕННО выбранные кнопки и встряхнём
      setStreak(0);

      const mistakeTerm = leftItem.term; // ошибку вешаем на терм пары, от которого отталкивались
      recordResult({ term: mistakeTerm, correct: false, firstTry: false, game: "matching" });

      setWasMistakeTerms((prev) => {
        const next = new Set(prev);
        next.add(mistakeTerm);
        return next;
      });

      setWrongIds(new Set([leftItem.id, rightItem.id]));
      setShake(true);

      // быстро убираем эффекты и сбрасываем выбор
      setTimeout(() => {
        setSelected(null);
        clearWrongFX();
      }, 350);
    }
  }

  // Классы для кнопок
  function btnClass(item) {
    const base = "btn justify-start transition";
    const isSolved = solvedTerms.has(item.term);
    const isSelected = selected && selected.item.id === item.id;
    const isWrong = wrongIds.has(item.id);

    if (isSolved) {
      return base + " bg-emerald-50 border-emerald-200 text-emerald-900 opacity-80 pointer-events-none";
    }
    if (isWrong) {
      return base + " bg-rose-50 border-rose-200";
    }
    if (isSelected) {
      return base + " ring-2 ring-indigo-400";
    }
    return base;
  }

  if (!deck.length) return <div className="p-6">No data…</div>;

  return (
    <Page title="Matching" subtitle="Match terms to their definitions." right={null}>
      {/* Статистика */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6">
        <Stat label="Solved" value={`${solvedCount}/${deck.length}`} />
        <Stat label="Score" value={score} />
        <Stat label="Streak" value={streak} />
        <Stat label="Accuracy" value={accuracy} />
      </div>

      {/* Игровое поле */}
      <div className={"grid grid-cols-1 sm:grid-cols-2 gap-3 " + (shake ? "animate-shake" : "")}>
        {/* Термины */}
        <div className="card card-pad">
          <div className="sub mb-2">Terms</div>
          <div className="flex flex-col gap-2">
            {left.map((item) => (
              <button
                type="button"
                key={item.id}
                className={btnClass(item)}
                onClick={() => handlePick("L", item)}
              >
                {item.term}
              </button>
            ))}
          </div>
        </div>

        {/* Определения */}
        <div className="card card-pad">
          <div className="sub mb-2">Definitions</div>
          <div className="flex flex-col gap-2">
            {right.map((item) => (
              <button
                type="button"
                key={item.id}
                className={btnClass(item)}
                onClick={() => handlePick("R", item)}
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
