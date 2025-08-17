import React, { useState } from "react";
import "./styles/index.css";
import { usePairsData } from "./dataHook";

import Matching from "./games/Matching.jsx";
import Flashcards from "./games/Flashcards.jsx";
import Quiz from "./games/Quiz.jsx";
import TypeTheWord from "./games/TypeTheWord.jsx";

export default function App() {
  const { pairs, source, error, updatedAt } = usePairsData();
  const [view, setView] = useState("menu");

  const meta = (
    <p className="text-xs text-slate-400">
      Source: <span className="font-mono">{source || "(loading...)"}</span>
      {updatedAt && <> · Updated: {updatedAt.toLocaleTimeString()}</>}
      {error && <> · <span className="text-rose-600">Error: {error}</span></>}
    </p>
  );

  if (view !== "menu") {
    const back = <button className="btn" onClick={()=>setView("menu")}>← Back to menu</button>;
    return (
      <div className="min-h-screen py-6">
        <div className="container mb-4">{back}</div>
        {view === "matching"   && <Matching     pairs={pairs} meta={meta} />}
        {view === "flashcards" && <Flashcards   pairs={pairs} meta={meta} />}
        {view === "quiz"       && <Quiz         pairs={pairs} meta={meta} />}
        {view === "type"       && <TypeTheWord  pairs={pairs} meta={meta} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6">
      <div className="container">
        <h1 className="h1">🎮 Vocabulary Games</h1>
        <p className="sub mt-1">Choose a game to practice the same word list.</p>
        <div className="mt-2">{meta}</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {[
            { id: "matching",   icon:"🧩", title:"Matching",   desc:"Match words to definitions" },
            { id: "flashcards", icon:"🃏", title:"Flashcards", desc:"Flip to reveal" },
            { id: "quiz",       icon:"❓", title:"Quiz",       desc:"Multiple choice" },
            { id: "type",       icon:"⌨️", title:"Type the Word", desc:"Type from definition" },
          ].map(g => (
            <button key={g.id} className="card card-pad text-left hover:bg-slate-50 active:scale-[0.99] transition"
                    onClick={()=>setView(g.id)}>
              <div className="text-lg font-semibold">{g.icon} {g.title}</div>
              <div className="sub">{g.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
