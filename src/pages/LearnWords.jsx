import React, { useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import { getProgress, getAllProgress, markLearned, resetProgress } from "../lib/progress";

const FILTERS = ["All", "Due", "Not learned", "Learned"];

export default function LearnWords({ pairs = [], onStart }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const map = getAllProgress();
  const now = Date.now();

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = pairs.filter(Boolean).filter(p =>
      !s ||
      p.term.toLowerCase().includes(s) ||
      p.def.toLowerCase().includes(s)
    );

    return base.filter(p => {
      const pr = getProgress(p.term);
      if (filter === "All") return true;
      if (filter === "Learned") return !!pr.learned;
      if (filter === "Not learned") return !pr.learned;
      if (filter === "Due") return (pr.dueAt || 0) <= now;
      return true;
    });
  }, [pairs, q, filter]);

  return (
    <Page
      title="📚 Learn Words"
      subtitle="Preview, filter and manage your word list."
      right={
        <div className="flex gap-2">
          <button className="btn" onClick={() => onStart?.("flashcards")}>Start Flashcards</button>
          <button className="btn" onClick={() => onStart?.("quiz")}>Start Quiz</button>
        </div>
      }
    >
      {/* Поиск + фильтры */}
      <div className="card card-pad mb-3 flex flex-col md:flex-row gap-2 md:items-center">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search words/definitions…"
          className="flex-1 card px-3 py-2 outline-none"
        />
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              className={"btn " + (filter===f ? "btn-primary" : "")}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Список слов */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {list.map((p, i) => {
          const pr = getProgress(p.term);
          const pct = pr.attempts ? Math.round((pr.correct/pr.attempts)*100) : 0;
          const due = pr.dueAt ? new Date(pr.dueAt).toLocaleDateString() : "—";
          return (
            <div key={p.key ?? p.term ?? i} className="p-3 rounded-xl border bg-white">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{p.term}</div>
                  <div className="text-sm text-slate-500">{p.def}</div>
                </div>
                <span className={"px-2 py-1 rounded text-xs " + (pr.learned ? "bg-emerald-100 border border-emerald-200" : "bg-slate-100 border border-slate-200")}>
                  {pr.learned ? "Learned" : "Not learned"}
                </span>
              </div>

              {/* мини-статы */}
              <div className="mt-2 text-xs text-slate-600 flex flex-wrap gap-3">
                <span>Box: <b>{pr.box||0}</b></span>
                <span>Acc: <b>{pct}%</b></span>
                <span>Attempts: <b>{pr.attempts||0}</b></span>
                <span>Due: <b>{due}</b></span>
              </div>

              {/* действия */}
              <div className="mt-2 flex gap-2">
                <button className="btn" onClick={() => markLearned(p.term, !pr.learned)}>
                  {pr.learned ? "Unlearn" : "Mark learned"}
                </button>
                <button className="btn" onClick={() => resetProgress(p.term)}>Reset</button>
              </div>
            </div>
          );
        })}
      </div>

      {list.length === 0 && (
        <div className="text-sm text-slate-500 mt-4">No items match your filters.</div>
      )}
    </Page>
  );
}
