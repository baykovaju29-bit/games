import React, { useMemo, useState } from "react";
import { shuffle } from "../utils";

export default function FlashcardsGame({ pairs = [] }) {
  const deck = useMemo(() => shuffle(pairs), [pairs]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);

  if (!deck.length) return <p>No data.</p>;
  const card = deck[idx];

  function next(isKnown) {
    setKnown(k => k + (isKnown ? 1 : 0));
    setIdx(i => (i + 1) % deck.length);
    setFlipped(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">Card {idx + 1} / {deck.length}</div>
        <div className="text-sm text-slate-500">Known: {known}</div>
      </div>
      <button
        onClick={() => setFlipped(f => !f)}
        className="w-full h-56 rounded-2xl border bg-white shadow flex items-center justify-center text-center p-6 text-xl active:scale-[0.99]"
      >
        {!flipped ? card.term : card.def}
      </button>
      <div className="flex gap-2 justify-center">
        <button onClick={() => next(false)} className="px-4 py-2 rounded-xl border bg-white shadow">Again</button>
        <button onClick={() => next(true)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white shadow">I know</button>
      </div>
      <p className="text-xs text-slate-400 text-center">Tip: click the card to flip (term ↔ definition).</p>
    </div>
  );
}
