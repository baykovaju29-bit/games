// src/pages/LearnWords.jsx
import React, { useEffect, useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import { getProgress, getAllProgress, markLearned, resetProgress, syncFromCloud } from "../lib/progress";
import { useNavigate } from "react-router-dom";

export default function LearnWords({ pairs = [], onStart }) {
  const navigate = useNavigate();

  // Подтянем облачный прогресс (необязательно — можно убрать, если не используешь Supabase)
  useEffect(() => {
    syncFromCloud().catch(() => {});
  }, []);

  // Соединяем пары с прогрессом
  const rows = useMemo(() => {
    return (pairs || []).filter(p => p?.term).map(p => {
      const prog = getProgress(p.term);
      return {
        term: p.term,
        def: p.def || "",
        ...prog,
      };
    });
  }, [pairs, getAllProgress()]); // принудительно пересчитать при изменении локального кеша

  // Простая фильтрация списка
  const [filter, setFilter] = useState("all"); // all | learned | unlearned
  const filtered = useMemo(() => {
    if (filter === "learned") return rows.filter(r => r.learned);
    if (filter === "unlearned") return rows.filter(r => !r.learned);
    return rows;
  }, [rows, filter]);

  // Навигация в игры
  const startFlashcards = () => {
    // если надо — можно передать режим в query: navigate("/flashcards?scope=unlearned");
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
      subtitle="Review your list, mark learned, and jump into practice."
      right={
        <div className="flex gap-2">
          <button type="button" className="btn" onClick={startFlashcards}>▶️ Start Flashcards</button>
          <button type="button" className="btn btn-primary" onClick={startQuiz}>▶️ Start Quiz</button>
        </div>
      }
    >
      {/* Фильтры */}
      <div className="mb-3 flex items-center gap-2">
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
          className={"btn " + (filter === "learned" ? "btn-primary" : "")}
          onClick={() => setFilter("learned")}
        >
          Learned
        </button>
      </div>

      {/* Таблица слов */}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-3 py-2">Term</th>
              <th className="text-left px-3 py-2">Definition</th>
              <th className="text-left px-3 py-2">Box</th>
              <th className="text-left px-3 py-2">Attempts</th>
              <th className="text-left px-3 py-2">Correct</th>
              <th className="text-left px-3 py-2">First‑try</th>
              <th className="text-left px-3 py-2">Learned</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.term} className="border-t">
                <td className="px-3 py-2 font-medium">{r.term}</td>
                <td className="px-3 py-2 text-slate-600">{r.def}</td>
                <td className="px-3 py-2">{r.box ?? 0}</td>
                <td className="px-3 py-2">{r.attempts ?? 0}</td>
                <td className="px-3 py-2">{r.correct ?? 0}</td>
                <td className="px-3 py-2">{r.firstTry ?? 0}</td>
                <td className="px-3 py-2">
                  {r.learned ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Yes</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">No</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    {r.learned ? (
                      <button
                        type="button"
                        className="btn"
                        onClick={() => markLearned(r.term, false)}
                        title="Mark as not learned"
                      >
                        Unlearn
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn"
                        onClick={() => markLearned(r.term, true)}
                        title="Mark as learned"
                      >
                        Mark learned
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn"
                      onClick={() => resetProgress(r.term)}
                      title="Reset stats for this term"
                    >
                      Reset
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan={8}>
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
