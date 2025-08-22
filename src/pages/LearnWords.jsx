// src/pages/LearnWords.jsx
import React, { useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import {
  getProgress,
  getAllProgress,
  markLearned,
  resetProgress,
} from "../lib/progress";

const FILTERS = ["All", "Due", "Not learned", "Learned"];

// маленький визуальный прогресс (как в Reword): ★☆☆☆☆
function Stars({ value = 0, max = 5 }) {
  const v = Math.max(0, Math.min(value, max));
  return (
    <span className="font-mono text-sm">
      {"★".repeat(v)}
      <span className="text-slate-300">{"★".repeat(max - v)}</span>
    </span>
  );
}

export default function LearnWords({ pairs = [], onStart }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const now = Date.now();

  // карта прогресса всех слов
  const progressMap = getAllProgress();

  // базовый список с присоединённым прогрессом
  const enriched = useMemo(() => {
    return (pairs || []).filter(Boolean).map((p) => {
      const pr = getProgress(p.term);
      const pct =
        pr.attempts ? Math.round((pr.correct / pr.attempts) * 100) : 0;
      return { ...p, _pr: pr, _pct: pct };
    });
  }, [pairs]);

  // поиск + фильтры сверху
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = enriched;

    if (s) {
      list = list.filter(
        (x) =>
          x.term.toLowerCase().includes(s) ||
          x.def.toLowerCase().includes(s)
      );
    }

    if (filter === "Due") {
      list = list.filter((x) => (x._pr.dueAt || 0) <= now);
    } else if (filter === "Learned") {
      list = list.filter((x) => !!x._pr.learned);
    } else if (filter === "Not learned") {
      list = list.filter((x) => !x._pr.learned);
    }

    return list;
  }, [enriched, q, filter]);

  // разбиение на секции «Learning» / «Learned»
  const learning = filtered.filter((x) => !x._pr.learned);
  const learned = filtered.filter((x) => x._pr.learned);

  return (
    <Page
      title="📚 Learn Words"
      subtitle="Build mastery with spaced repetition. Filter, review and manage your list."
      right={
        <div className="flex gap-2">
          <button className="btn" onClick={() => onStart?.("flashcards")}>
            Start Flashcards
          </button>
          <button className="btn" onClick={() => onStart?.("quiz")}>
            Start Quiz
          </button>
        </div>
      }
    >
      {/* Поиск + фильтры */}
      <div className="card card-pad mb-4 flex flex-col md:flex-row gap-2 md:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search words / definitions…"
          className="flex-1 card px-3 py-2 outline-none"
        />
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={"btn " + (filter === f ? "btn-primary" : "")}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Секция Learning */}
      <h2 className="h2 mb-2">Learning</h2>
      <WordGrid items={learning} />

      {/* Секция Learned */}
      <h2 className="h2 mt-8 mb-2">Learned</h2>
      <WordGrid items={learned} emptyNote="No learned words yet — keep practicing!" />
    </Page>
  );
}

function WordGrid({ items, emptyNote = "No words match your filters." }) {
  if (!items.length) {
    return <div className="text-sm text-slate-500">{emptyNote}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {items.map((x, i) => (
        <WordCard key={x.key ?? x.term ?? i} p={x} />
      ))}
    </div>
  );
}

function WordCard({ p }) {
  const pr = p._pr;
  const pct = p._pct;
  const due =
    pr.dueAt && pr.dueAt > 0
      ? new Date(pr.dueAt).toLocaleDateString()
      : "—";

  return (
    <div className="p-3 rounded-xl border bg-white">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{p.term}</div>
          <div className="text-sm text-slate-500">{p.def}</div>
        </div>
        <span
          className={
            "px-2 py-1 rounded text-xs " +
            (pr.learned
              ? "bg-emerald-100 border border-emerald-200"
              : "bg-slate-100 border border-slate-200")
          }
        >
          {pr.learned ? "Learned" : "Learning"}
        </span>
      </div>

      {/* Прогресс: звёзды + мини-метрики */}
      <div className="mt-2 flex items-center justify-between">
        <Stars value={pr.box || 0} max={5} />
        <div className="text-xs text-slate-600 flex gap-3">
          <span>Box: <b>{pr.box || 0}</b></span>
          <span>Acc: <b>{pct}%</b></span>
          <span>Attempts: <b>{pr.attempts || 0}</b></span>
          <span>Due: <b>{due}</b></span>
        </div>
      </div>

      {/* Действия */}
      <div className="mt-2 flex gap-2">
        <button
          className="btn"
          onClick={() => markLearned(p.term, !pr.learned)}
        >
          {pr.learned ? "Unlearn" : "Mark learned"}
        </button>
        <button className="btn" onClick={() => resetProgress(p.term)}>
          Reset
        </button>
      </div>
    </div>
  );
}
