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

  // Левая/правая колонка (перемешанные). В каждом элементе держим term,
  // чтобы легко сопоставлять при проверке.
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
          term: p.term,
        }))
      ),
    [deck]
  );

  // --- Состояние игры ---
  const [selected, setSelected] = useState(null); // { side: 'L'|'R', item:{id,term/def,term}}
  const [solvedTerms, setSolvedTerms] = useState(new Set()); // какие terms уже решены (зелёные)
  const [wasMistake, setWasMistake] = useState(new Set()); // на каких терминах уже была ошибка (для firstTry=false)
  const [wrongTerm, setWrongTerm] = useState(null); // какой term подсветить красным при ошибке
  const [shake, setShake] = useState(false); // встряска контейнера

  // Статистика
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const accuracy = answered ? Math.round((score / answered) * 100) + "%" : "—";
  const solvedCount = solvedTerms.size;

  function clearWrongFX() {
    setWrongTerm(null);
    setShake(false);
  }

  function handlePick(side, item) {
    // Нажатия по уже решённому — игнор
    if (solvedTerms.has(item.term)) return;

    // Если ничего не выбрано — просто сохранить выбор
    if (!selected) {
      setSelected({ side, item });
      return;
    }

    // Если клик по той же стороне — заменить выбор
    if (selected.side === side) {
      setSelected({ side, item });
      return;
    }

    // Есть выбранное с другой стороны — проверяем пару
    const termA = selected.side === "L" ? selected.item.term : item.term;
    const termB = selected.side === "L" ? item.term : selected.item.term;
    const isCorrect = termA === termB;
    setAnswered((n) => n + 1);

    if (isCorrect) {
      // Правильно
      setScore((s) => s + 1);
      setStreak((st) => st + 1);

      const firstTry = !wasMistake.has(termA);
      recordResult({
        term: termA,
        correct: true,
        firstTry,
        game: "matching",
      });

      setSolvedTerms((prev) => {
        const next = new Set(prev);
        next.add(termA);
        return next;
      });

      // Сбросить отметку "была ошибка", если она была
      setWasMistake((prev) => {
        const next = new Set(prev);
        next.delete(termA);
        return next;
      });

      // Очистить активный выбор
      setSelected(null);
      clearWrongFX();
    } else {
      // Ошибка: красная подсветка и встряска
      setStreak(0);
      recordResult({
        term: selected.side === "L" ? selected.item.term : item.term,
        correct: false,
        firstTry: false,
        game: "matching",
      });

      // помечаем, что на этом term уже была ошибка
      const mistakeTerm =
        selected.side === "L" ? selected.item.term : item.term;
      setWasMistake((prev) => {
        const next = new Set(prev);
        next.add(mistakeTerm);
        return next;
      });

      // визуальные эффекты
      const wrongFor = selected.side === "L" ? selected.item.term : item.term;
      setWrongTerm(wrongFor);
      setShake(true);

      // через небольшую паузу убираем эффекты и сбрасываем выбор
      setTimeout(() => {
        setSelected(null);
        clearWrongFX();
      }, 350);
    }
  }

  // Классы для кнопок
  function btnClass(side, item) {
    const base = "btn justify-start transition";
    const isSolved = solvedTerms.has(item.term);
    const isSelected =
      selected && selected.side === side && selected.item.id === item.id;
    const isWrong =
      wrongTerm && (item.term === wrongTerm); // подсветим обе кнопки пары

    if (isSolved) {
      return (
        base +
        " bg-emerald-50 border-emerald-200 text-emerald-900 opacity-80 pointer-events-none"
      );
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
      {/* Статы */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6">
        <Stat label="Solved" value={`${solvedCount}/${deck.length}`} />
        <Stat label="Score" value={score} />
        <Stat label="Streak" value={streak} />
        <Stat label="Accuracy" value={accuracy} />
      </div>

      {/* Две колонки */}
      <div className={"grid grid-cols-1 sm:grid-cols-2 gap-3 " + (shake ? "animate-shake" : "")}>
        {/* Левая: термины */}
        <div className="card card-pad">
          <div className="sub mb-2">Terms</div>
          <div className="flex flex-col gap-2">
            {left.map((item) => (
              <button
                type="button"
                key={item.id}
                className={btnClass("L", item)}
                onClick={() => handlePick("L", item)}
              >
                {item.term}
              </button>
            ))}
          </div>
        </div>

        {/* Правая: определения */}
        <div className="card card-pad">
          <div className="sub mb-2">Definitions</div>
          <div className="flex flex-col gap-2">
            {right.map((item) => (
              <button
                type="button"
                key={item.id}
                className={btnClass("R", item)}
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
