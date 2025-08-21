import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./styles/index.css";
import { usePairsData } from "./dataHook";

// Игры
import Matching from "./games/Matching.jsx";
import Flashcards from "./games/Flashcards.jsx";
import Quiz from "./games/Quiz.jsx";
import TypeTheWord from "./games/TypeTheWord.jsx";
import SentenceBuilder from "./games/SentenceBuilder.jsx";
import FillTheGap from "./games/FillTheGap.jsx";

// Страница обучения слов
import LearnWords from "./pages/LearnWords.jsx";
import Home from "./Home";        // твоя главная страница с играми
import LearnWords from "./LearnWords";  // страница для изучения слов

function Menu() {
  // карточки меню
  const VOCAB_GAMES = [
    { to: "/matching",   icon: "🧩", title: "Matching",       desc: "Match words to definitions" },
    { to: "/flashcards", icon: "🃏", title: "Flashcards",     desc: "Flip to reveal" },
    { to: "/quiz",       icon: "❓", title: "Quiz",           desc: "Multiple choice" },
    { to: "/type",       icon: "⌨️", title: "Type the Word",  desc: "Type from definition" },
  ];
  const GRAMMAR_GAMES = [
    { to: "/builder",    icon: "🧱", title: "Sentence Builder", desc: "Arrange words to form a sentence" },
    { to: "/fill",       icon: "✍️", title: "Fill the Gap",     desc: "Type the missing word" },
  ];

  return (
    <div className="container max-w-5xl py-6">
      {/* Кнопка Learn words справа сверху */}
      <div className="flex justify-end mb-6">
        <Link to="/learn" className="btn">📚 Learn words</Link>
      </div>

      {/* Vocabulary */}
      <h1 className="h1">🎮 Vocabulary Games</h1>
      <p className="sub mt-1">Choose a game to practice the same word list.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {VOCAB_GAMES.map((g) => (
          <Link key={g.to} to={g.to} className="card card-pad text-left hover:bg-slate-50 transition">
            <div className="text-lg font-semibold">{g.icon} {g.title}</div>
            <div className="sub">{g.desc}</div>
          </Link>
        ))}
      </div>

      {/* Grammar */}
      <h2 className="h1 mt-12">📘 Grammar Games</h2>
      <p className="sub mt-1">Practice sentence structure and grammar rules.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {GRAMMAR_GAMES.map((g) => (
          <Link key={g.to} to={g.to} className="card card-pad text-left hover:bg-slate-50 transition">
            <div className="text-lg font-semibold">{g.icon} {g.title}</div>
            <div className="sub">{g.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const { pairs, source, error, updatedAt } = usePairsData();

  const meta = (
    <div className="text-xs text-slate-500">
      Source: <span className="font-mono">{source || "/data.txt"}</span>
      {updatedAt && <> · Updated: {updatedAt.toLocaleTimeString()}</>}
      {error && <> · <span className="text-rose-600">Error: {error}</span></>}
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen py-6">
        <Routes>
          {/* Главная страница с разделами */}
          <Route path="/" element={<Menu />} />

          {/* Игры по отдельным ссылкам */}
          <Route path="/matching"   element={<Matching pairs={pairs} meta={meta} />} />
          <Route path="/flashcards" element={<Flashcards pairs={pairs} meta={meta} />} />
          <Route path="/quiz"       element={<Quiz pairs={pairs} meta={meta} />} />
          <Route path="/type"       element={<TypeTheWord pairs={pairs} meta={meta} />} />
          <Route path="/builder"    element={<SentenceBuilder meta={meta} />} />
          <Route path="/fill"       element={<FillTheGap meta={meta} />} />

          {/* Новая страница Learn words по отдельному URL */}
          <Route path="/learn"      element={<LearnWords pairs={pairs} onStartPath="/flashcards" />} />
        </Routes>

        {/* фиксированный футер внизу справа */}
        <div className="fixed bottom-3 right-3 bg-white/80 backdrop-blur border rounded-lg px-3 py-2 shadow-sm">
          {meta}
        </div>
      </div>
    </Router>
  );
}
