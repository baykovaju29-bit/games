import React, { useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { shuffle } from "../utils";

export default function Flashcards({ pairs = [], meta }) {
  const deck = useMemo(() => shuffle(pairs), [pairs]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);

  const card = deck[idx] || {};

  function next(isKnown) {
    setKnown(k => k + (isKnown ? 1 : 0));
    setIdx(i => (i + 1) % Math.max(deck.length, 1));
    setFlipped(false);
  }

  return (
    <Page
      title="Flashcards"
      subtitle="Tap the card to flip. Front: word · Back: definition."
      right={<button className="btn" onClick={() => { setIdx(0); setKnown(0); setFlipped(false); }}>Reset</button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Stat label="Card"  value={`${idx + 1}/${deck.length || 0}`} />
        <Stat label="Known" value={known} />
        <Stat label="Left"  value={Math.max((deck.length || 0) - known, 0)} />
      </div>

      {/* 3D flip card */}
      <div className="perspective">
        <button
          onClick={() => setFlipped(f => !f)}
          className={
            "relative w-full h-64 md:h-72 card text-xl transition-transform duration-500 preserve-3d " +
            (flipped ? "rotate-y-180" : "")
          }
        >
          {/* FRONT — term */}
          <div className="absolute inset-0 card-pad backface-hidden flex items-center justify-center text-center">
            <div className="font-semibold">{card.term || "—"}</div>
          </div>

          {/* BACK — definition */}
          <div className="absolute inset-0 card-pad backface-hidden rotate-y-180 flex items-center justify-center text-center">
            <div className="text-base md:text-lg">{card.def || "—"}</div>
          </div>
        </button>
      </div>

      <div className="mt-4 flex gap-2 justify-center">
        <button className="btn" onClick={() => next(false)}>Again</button>
        <button className="btn btn-primary" onClick={() => next(true)}>I know</button>
      </div>

      <div className="mt-4">{meta}</div>
    </Page>
  );
}
