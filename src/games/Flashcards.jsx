import React, { useMemo, useState } from "react";
import { shuffle } from "../utils";

export default function Flashcards({ pairs = [] }) {
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
    <div>
      <p>Card {idx + 1}/{deck.length} · Known: {known}</p>
      <button
        onClick={() => setFlipped(f => !f)}
        style={{width:"100%", height:220, border:"1px solid #ddd", background:"#fff", fontSize:22}}
      >
        {!flipped ? card.term : card.def}
      </button>
      <div style={{display:"flex", gap:8, justifyContent:"center", marginTop:8}}>
        <button onClick={()=>next(false)}>Again</button>
        <button onClick={()=>next(true)}>I know</button>
      </div>
      <p style={{textAlign:"center", fontSize:12, color:"#666"}}>Tip: click the card to flip.</p>
    </div>
  );
}
