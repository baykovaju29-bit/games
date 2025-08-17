import React, { useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import { shuffle } from "../utils";

export default function Flashcards({ pairs=[], meta }) {
  const deck = useMemo(()=>shuffle(pairs), [pairs]);
  const [idx, setIdx] = useState(0);
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState(0);
  const card = deck[idx] || {};

  function next(isKnown){
    setKnown(k=>k+(isKnown?1:0));
    setIdx(i=>(i+1)%Math.max(deck.length,1));
    setFlip(false);
  }

  return (
    <Page title="Flashcards" subtitle="Click the card to flip. Practice recognition & recall."
          right={<button className="btn" onClick={()=>{setIdx(0); setKnown(0); setFlip(false);}}>Reset</button>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Stat label="Card"  value={`${idx+1}/${deck.length||0}`}/>
        <Stat label="Known" value={known}/>
        <Stat label="Left"  value={Math.max(deck.length-known,0)}/>
      </div>

      <button onClick={()=>setFlip(f=>!f)} className="card w-full h-64 md:h-72 flex items-center justify-center text-center text-xl card-pad">
        {!flip ? (card.term || "—") : (card.def || "—")}
      </button>

      <div className="mt-4 flex gap-2 justify-center">
        <button className="btn" onClick={()=>next(false)}>Again</button>
        <button className="btn btn-primary" onClick={()=>next(true)}>I know</button>
      </div>

      <div className="mt-4">{meta}</div>
    </Page>
  );
}
