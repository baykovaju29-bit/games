import React, { useState } from "react";
import "./styles/index.css";
import { usePairsData } from "./dataHook";

import Matching from "./games/Matching.jsx";
import Flashcards from "./games/Flashcards.jsx";
import Quiz from "./games/Quiz.jsx";
import TypeTheWord from "./games/TypeTheWord.jsx";
import SentenceBuilder from "./games/SentenceBuilder.jsx";

export default function App() {
  const { pairs, source, error, updatedAt } = usePairsData();
  const [view, setView] = useState("menu");          // экран игры или "menu"
  const [section, setSection] = useState("vocab");    // "vocab" | "grammar"

  // фиксированный футер внизу справа
  const meta = (
    <div className="text-xs text-slate-500">
      Source: <span className="font-mono">{source || "/data.txt"}</span>
      {updatedAt && <> · Updated: {updatedAt.toLocaleTimeString()}</>}
      {error && <> · <span className="text-rose-600">Error: {error}</span></>}
    </div>
  );

  // --- страницы игр ---
  if (view !== "menu") {
    const back = (
      <div className="container mb-4">
        <button className="btn" onClick={() => setView("menu")}>← Back to menu</button>
      </div>
    );
    return (
      <div className="min-h-screen py-6">
        {back}
        {view === "matching"    && <Matching      pairs={pairs} meta={meta} />}
        {view === "flashcards"  && <Flashcards    pairs={pairs} meta={meta} />}
        {view === "quiz"        && <Quiz          pairs={pairs} meta={meta} />}
        {view === "type"        && <TypeTheWord   pairs={pairs} meta={meta} />}
        {view === "builder"     && <SentenceBuilder          meta={meta} />}
        {/* фиксированный футер внизу справа */}
        <div className="fixed bottom-3 right-3 bg-white/80 backdrop-blur border rounded-lg px-3 py-2 shadow-sm">
          {meta}
        </div>
      </div>
    );
  }

  // --- меню: вкладки Vocabulary / Grammar ---
  const VOCAB_GAMES = [
    { id: "matching",   icon:"🧩", title:"Matching",   desc:"Match words to definitions" },
    { id: "flashcards", icon:"🃏", title:"Flashcards", desc:"Flip to reveal" },
    { id: "quiz",       icon:"❓", title:"Quiz",       desc:"Multiple choice" },
    { id: "type",       icon:"⌨️", title:"Type the Word", desc:"Type from definition" },
  ];

  const GRAMMAR_GAMES = [
    { id: "builder",    icon:"🧱", title:"Sentence Builder", desc:"Arrange words to form a sentence" },
    // сюда позже добавим Fill-the-Gap, Grammar Auction, Tense Duel и т.д.
  ];

  const active = section === "vocab" ? VOCAB_GAMES : GRAMMAR_GAMES;

  return (
    <div className="min-h-screen py-6">
      <div className="container">
        {/* Вкладки */}
        <div className="flex gap-2 mb-3">
          <button
            className={"btn " + (section==="vocab" ? "btn-primary" : "")}
            onClick={() => setSection("vocab")}
          >
            🎮 Vocabulary Games
          </button>
          <button
            className={"btn " + (section==="grammar" ? "btn-primary" : "")}
            onClick={() => setSection("grammar")}
          >
            📘 Grammar Games
          </button>
        </div>

        {/* Заголовок/подзаголовок под выбранную вкладку */}
        <h1 className="h1">
          {section === "vocab" ? "🎮 Vocabulary Games" : "📘 Grammar Games"}
        </h1>
        <p className="sub mt-1">
          {section === "vocab"
            ? "Choose a game to practice the same word list."
            : "Choose a game to practice grammar skills."}
        </p>

        {/* Карточки игр */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {active.map(g => (
            <button key={g.id}
                    className="card card-pad text-left hover:bg-slate-50 active:scale-[0.99] transition"
                    onClick={()=>setView(g.id)}>
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
