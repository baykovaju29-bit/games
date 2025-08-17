import React, { useState } from "react";
export default function Flashcards({ pairs }) {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const card = pairs[i % pairs.length];
  return (
    <div>
      <p>Card {i+1}/{pairs.length}</p>
      <button onClick={()=>setFlip(f=>!f)} style={{padding:16, border:"1px solid #ccc"}}>
        {!flip ? card.term : card.def}
      </button>
      <div style={{marginTop:8}}>
        <button onClick={()=>{setI(i+1); setFlip(false);}}>Next</button>
      </div>
    </div>
  );
}
