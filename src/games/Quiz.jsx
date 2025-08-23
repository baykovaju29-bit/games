// src/games/Quiz.jsx
import React, { useMemo, useState, useEffect } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { shuffle } from "../utils";
import { recordResult } from "../lib/progress";

/**
 * Строим массив вопросов:
 * prompt = definition, правильный ответ = term,
 * добавляем до 3 неправильных term из других пар, перемешиваем опции и сами вопросы.
 */
function buildQuestions(pairs) {
  const base = (pairs || []).filter(p => p?.term && p?.def);
  if (!base.length) return [];

  const questions = base.map(p => {
    const distractors = shuffle(base.filter(x => x.term !== p.term))
      .slice(0, Math.max(0, Math.min(3, base.length - 1)))
      .map(x => x.term);
    const options = shuffle([p.term, ...distractors]);
    return {
      term: p.term,
      prompt: p.def,     // показываем определение
      options            // варианты — слова (term)
    };
  });

  return shuffle(questions);
}

export default function Quiz({ pairs = [], meta }) {
  // генерируем набор вопросов «стабильно» из pairs
  const questions = useMemo(() => buildQuestions(pairs), [pairs]);

  // индекс текущего вопроса
  const [q, setQ] = useState(0);

  // для текущего вопроса: отмечали ли ошибку (для firstTry)
  const [madeMistake, setMadeMistake] = useState(false);

  // визуальные эффекты
  const [shake, setShake] = useState(false);
  const [selected, setSelected] = useState(null);     // выбранное значение (строка)
  const [lock, setLock] = useState(false);            // временно блокируем кнопки на анимацию

  // статистика
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const accuracy = answered ? Math.round((score / answered) * 100) + "%" : "—";

  useEffect(() => {
    // при переходе на новый вопрос — сброс локальных эффектов
    setSelected(null);
    setMadeMistake(false);
    setShake(false);
    setLock(false);
  }, [q]);

  if (!questions.length) return <div className="p-6">No data…</div>;
  const curr = questions[q];

  function nextQuestion() {
    setQ(n => (n + 1) % questions.length);
  }

  function choose(opt) {
    if (lock) return;
    setSelected(opt);

    const correct = opt === curr.term;
    setAnswered(n => n + 1);

    if (correct) {
      setScore(s => s + 1);
      setStreak(st => st + 1);

      recordResult({
        term: curr.term,
        correct: true,
        firstTry: !madeMistake,
        game: "quiz",
      });

      // небольшая задержка — и на следующий вопрос
      setLock(true);
      setTimeout(nextQuestion, 550);
    } else {
      setStreak(0);
      setMadeMistake(true);
      recordResult({
        term: curr.term,
        correct: false,
        firstTry: false,
        game: "quiz",
      });

      // встряска контейнера и краткая блокировка
      setShake(true);
      setLock(true);
      setTimeout(() => {
        setShake(false);
        setSelected(null);
        setLock(false);
      }, 400);
    }
  }

  // классы кнопок в зависимости от состояния
  function optionClass(opt) {
    const base = "btn text-left justify-start transition";
    if (selected == null) return base; // пока ничего не выбрано

    // если уже выбран ответ:
    if (opt === curr.term && selected === curr.term) {
      // правильный и выбранный → зелёный
      return base + " bg-emerald-50 border-emerald-200 text-emerald-900";
    }
    if (opt === selected && selected !== curr.term) {
      // выбранный, но неверный → красный
      return base + " bg-rose-50 border-rose-200";
    }
    if (selected === curr.term) {
      // выбран правильный — остальные остаются обычными, можно приглушить
      return base + " opacity-90";
    }
    // выбран неправильный — остальные обычные
    return base;
  }

  return (
    <Page title="Quiz" subtitle="Choose the correct word for the definition." right={null}>
      {/* Статы */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6">
        <Stat label="Question" value={`${q + 1}/${questions.length}`} />
        <Stat label="Score" value={score} />
        <Stat label="Streak" value={streak} />
        <Stat label="Accuracy" value={accuracy} />
      </div>

      {/* Вопрос */}
      <div className={"card card-pad mb-4 text-lg " + (shake ? "animate-shake" : "")}>
        {curr.prompt}
      </div>

      {/* Варианты */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {curr.options.map(opt => (
          <button
            type="button"
            key={opt}
            className={optionClass(opt)}
            onClick={() => choose(opt)}
            disabled={lock}
            title="Choose answer"
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="mt-4">{meta}</div>
    </Page>
  );
}
