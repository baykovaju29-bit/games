// src/pages/LearnWords.jsx
import React, { useEffect, useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import {
  getProgress,
  getAllProgress,
  markLearned,
  resetProgress,
  syncFromCloud,
} from "../lib/progress";
import { useNavigate } from "react-router-dom";

// вычисляем процент освоения по данным прогресса
function computeProgress(p) {
  const box = Math.max(0, Math.min(5, p.box ?? 0));
  const attempts = Math.max(0, p.attempts ?? 0);
  const correct = Math.max(0, p.correct ?? 0);
  const firstTry = Math.max(0, p.firstTry ?? 0);

  const base = box / 5; // 0..1
  const acc = attempts > 0 ? correct / attempts : 0; // 0..1
  const first = attempts > 0 ? firstTry / attempts : 0; // 0..1

  const score = Math.min(1, 0.7 * base + 0.2 * acc + 0.1 * first);
  return Math.round(score * 100); // %
}

function ProgressBar({ pct }) {
  const color =
    pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-28 h-2 rounded bg-slate-200 overflow-hidden">
        <div
          className={`h-2 ${color}`}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
      <span className="text-xs text-slate-600 tabular-nums">{pct}%</span>
    </div>
  );
}

export default function LearnWords({ pairs = [], onStart }) {
  const navigate = useNavigate();

  // Подтянуть прогресс из облака при входе (необязательно; можно убрать)
  useEffect(() => {
    syncFromCloud().catch(() => {});
  }, []);

  // Соединяем пары со статами
  const rows = useMemo(() => {
    const map = getAllProgress(); // локальный кэш (и после syncFromCloud актуализируется)
    return (pairs || [])
      .filter((p) => p?.term)
      .map((p) => {
        const prog = map[(p.term || "").trim().toLowerCase()] || getProgress(p.term);
        const pct = computeProgress(prog);
        return {
          term: p.term,
          def: p.def || "",
          ...prog,
          progressPct: pct,
        };
      });
  }, [pairs, getAllProgress()]); // пересчёт при обновлении локального кэша

  // Фильтрация
  const [filter, setFilter] = useState("all"); // all | learned | unlearned | low
  const filtered = useMemo(() => {
    let arr = rows;
    if (filter === "learned") arr = rows.filter((r) => r.learned);
    if (filter === "unlearned") arr = rows.filter((r) => !r.learned);
    if (filter === "low") arr = rows.filter((r) => r.progressPct < 50);
    // по умолчанию сортируем по возрастанию прогресса — удобно добивать слабые
    return [...arr].sort((a, b) => a.progressPct - b.progressPct);
  }, [rows, filter]);

  // Навигация в игры
  const startFlashcards = () => {
    navigate("/flashcards");
    onStart && onStart("flashcards");
  };
  const startQuiz = () => {
    navigate("/quiz");
    onStart && onStart("quiz");
  };

  return (
    <Page
      title="Learn Words"
      subtitle="Review your list, track progress, and jump into practice."
      right={
        <div className="flex gap-2">
          <button type="button" className="btn" onClick={startFlashcards}>
            ▶️ Start Flashcards
          </button>
          <button type="button" className="btn btn-primary" onClick={startQuiz}>
            ▶️ Start Quiz
          </button>
        </div>
      }
    >
      {/* Фильтры */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="sub">Filter:</span>
        <button
          type="button"
          className={"btn " + (filter === "all" ? "btn-primary" : "")}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          type="button"
          className={"btn " + (filter === "unlearned" ? "btn-primary" : "")}
          onClick={() => setFilter("unlearned")}
        >
          Need practice
        </button>
        <button
          type="button"
          className={"btn " + (filter === "low" ? "btn-primary" : "")}
          onClick={() => setFilter("low")}
        >
          &lt; 50% progress
        </button>
        <button
          type="button"
          className={"btn " + (filter === "learned" ? "btn-primary" : "")}
          onClick={() => setFilter("learned")}
        >
          Learned
        </button>
      </div>

      {/* Таблица */}
<div className="card max-w-7xl mx-12 px-2">
  <table className="w-full text-sm border-collapse">
    <thead className="bg-slate-50">
      <tr>
        <th className="text-left px-4 py-3">Term</th>
        <th className="text-left px-4 py-3 w-3/5">Definition</th>
        <th className="text-left px-4 py-3">Progress</th>
        <th className="text-left px-4 py-3">Box</th>
        <th className="text-left px-4 py-3">Attempts</th>
        <th className="text-left px-4 py-3">Correct</th>
        <th className="text-left px-4 py-3">First-try</th>
        <th className="text-left px-4 py-3">Learned</th>
        <th className="text-left px-4 py-3">Actions</th>
      </tr>
    </thead>
    <tbody>
      {filtered.map((r) => (
        <tr key={r.term} className="border-t">
          <td className="px-4 py-3 font-medium">{r.term}</td>
          <td className="px-4 py-3 text-slate-600">{r.def}</td>
          <td className="px-4 py-3">
            <ProgressBar pct={r.progressPct} />
          </td>
          <td className="px-4 py-3 tabular-nums">{r.box ?? 0}</td>
          <td className="px-4 py-3 tabular-nums">{r.attempts ?? 0}</td>
          <td className="px-4 py-3 tabular-nums">{r.correct ?? 0}</td>
          <td className="px-4 py-3 tabular-nums">{r.firstTry ?? 0}</td>
          <td className="px-4 py-3">
            {r.learned ? (
              <span className="inline-flex items-center px-3 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Yes
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                No
              </span>
            )}
          </td>
          <td className="px-4 py-3">
            <div className="flex gap-3">
              {r.learned ? (
                <button
                  type="button"
                  className="btn w-28"
                  onClick={() => markLearned(r.term, false)}
                >
                  Unlearn
                </button>
              ) : (
                <button
                  type="button"
                  className="btn w-28"
                  onClick={() => markLearned(r.term, true)}
                >
                  Mark learned
                </button>
              )}
              <button
                type="button"
                className="btn w-24"
                onClick={() => resetProgress(r.term)}
              >
                Reset
              </button>
            </div>
          </td>
        </tr>
      ))}
      {filtered.length === 0 && (
        <tr>
          <td className="px-4 py-6 text-center text-slate-500" colSpan={9}>
            Nothing to show.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
    </Page>
  );
}
