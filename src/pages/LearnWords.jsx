import React, { useMemo, useState } from "react";
import Page from "../ui/Page.jsx";

export default function LearnWords({ pairs = [], onStart }) {
  const [q, setQ] = useState("");
  const [showDefs, setShowDefs] = useState(true);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return pairs;
    return pairs.filter(
      (p) =>
        p.term.toLowerCase().includes(s) ||
        p.def.toLowerCase().includes(s)
    );
  }, [pairs, q]);

  return (
    <Page
      title="📚 Learn Words"
      subtitle="Preview your word list before practicing."
      right={
        <div className="flex gap-2">
          <button className="btn" onClick={() => setShowDefs((v) => !v)}>
            {showDefs ? "Hide definitions" : "Show definitions"}
          </button>
          {/* Быстрый старт во Flashcards/Quiz */}
          <button className="btn btn-primary" onClick={() => onStart?.("flashcards")}>
            Start Flashcards
          </button>
        </div>
      }
    >
      <div className="card card-pad mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search words/definitions…"
          className="w-full card px-3 py-2 outline-none"
        />
      </div>

      <div className="card card-pad">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {list.map((p, i) => (
            <div key={p.key ?? i} className="p-3 rounded-xl border bg-white">
              <div className="font-semibold">{p.term}</div>
              {showDefs && <div className="text-sm text-slate-500 mt-1">{p.def}</div>}
            </div>
          ))}
        </div>
        {list.length === 0 && (
          <div className="text-sm text-slate-500">No matches for “{q}”.</div>
        )}
      </div>
    </Page>
  );
}
