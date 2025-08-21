import React, { useState } from "react";
import "./styles/index.css";
import { usePairsData } from "./dataHook";

// импорт
import Matching from "./games/Matching.jsx";
import Flashcards from "./games/Flashcards.jsx";
import Quiz from "./games/Quiz.jsx";
import TypeTheWord from "./games/TypeTheWord.jsx";
import SentenceBuilder from "./games/SentenceBuilder.jsx";
import FillTheGap from "./games/FillTheGap.jsx";
import LearnWords from "./pages/LearnWords.jsx";

export default function App() {
  const { pairs, source, error, updatedAt } = usePairsData();
  const [view, setView] = useState("menu"); // "menu" или id игры

  // фиксированная строка внизу справа
  const meta = (
    <div className="text-xs text-slate-500">
      Source: <span className="font-mono">{source || "/data.txt"}</span>
      {updatedAt && <> · Updated: {updatedAt.toLocaleTimeString()}</>}
      {error && <> · <span className="text-rose-600">Error: {error}</span></>}
    </div>
  );

  // ===== Экран отдельной игры - Блок рендера экранов =====
  if (view !== "menu") {
    return (
      <div className="min-h-screen py-6">
        <div className="container mb-4">
          <button className="btn" onClick={() => setView("menu")}>← Back to menu</button>
        </div>

        {view === "matching"    && <Matching      pairs={pairs} meta={meta} />}
        {view === "flashcards"  && <Flashcards    pairs={pairs} meta={meta} />}
        {view === "quiz"        && <Quiz          pairs={pairs} meta={meta} />}
        {view === "type"        && <TypeTheWord   pairs={pairs} meta={meta} />}
        {view === "builder"     && <SentenceBuilder           meta={meta} />}
        {view === "fill"        && <FillTheGap      meta={meta} />}
        {view === "learn"       && <LearnWords pairs={pairs} onStart={(id)=>setView(id)} />}

        {/* фиксированный футер */}
        <div className="fixed bottom-3 right-3 bg-white/80 backdrop-blur border rounded-lg px-3 py-2 shadow-sm">
          {meta}
        </div>
        {/* top-right learn button */}
<div className="fixed top-3 right-3 z-50">
  <button className="btn" onClick={() => setView("learn")}>📚 Learn words</button>
</div>
      </div>
    );
  }

  // ===== Меню: две секции (Vocabulary + Grammar) =====
  const VOCAB_GAMES = [
    { id: "matching",   icon:"🧩", title:"Matching",      desc:"Match words to definitions" },
    { id: "flashcards", icon:"🃏", title:"Flashcards",    desc:"Flip to reveal" },
    { id: "quiz",       icon:"❓", title:"Quiz",          desc:"Multiple choice" },
    { id: "type",       icon:"⌨️", title:"Type the Word",desc:"Type from definition" },
  ];

  const GRAMMAR_GAMES = [
    { id: "builder",    icon:"🧱", title:"Sentence Builder", desc:"Arrange words to form a sentence" },
    { id: "fill", icon:"✍️", title:"Fill the Gap", desc:"Type the missing word" },
    // позже можно добавить: Fill the Gap, Grammar Auction, Tense Duel и т.д.
  ];

  return (
    <div className="min-h-screen py-6">
      <div className="container max-w-5xl">
        {/* ------- Vocabulary Section ------- */}
        <h1 className="h1">🎮 Vocabulary Games</h1>
        <p className="sub mt-1">Choose a game to practice the same word list.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {VOCAB_GAMES.map(g => (
            <button
              key={g.id}
              className="card card-pad text-left hover:bg-slate-50 active:scale-[0.99] transition"
              onClick={()=>setView(g.id)}
            >
              <div className="text-lg font-semibold">{g.icon} {g.title}</div>
              <div className="sub">{g.desc}</div>
            </button>
          ))}
        </div>

        {/* ------- Grammar Section ------- */}
        <h2 className="h1 mt-12">📘 Grammar Games</h2>
        <p className="sub mt-1">Practice sentence structure and grammar rules.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {GRAMMAR_GAMES.map(g => (
            <button
              key={g.id}
              className="card card-pad text-left hover:bg-slate-50 active:scale-[0.99] transition"
              onClick={()=>setView(g.id)}
            >
              <div className="text-lg font-semibold">{g.icon} {g.title}</div>
              <div className="sub">{g.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* фиксированный футер внизу справа */}
      <div className="fixed bottom-3 right-3 bg-white/80 backdrop-blur border rounded-lg px-3 py-2 shadow-sm">
        {meta}
      </div>
    </div>
  );
}
