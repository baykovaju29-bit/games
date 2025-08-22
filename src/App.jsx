import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./styles/index.css";
import { usePairsData } from "./dataHook";
import GameScreen from "./ui/GameScreen.jsx";

// Игры
import Matching from "./games/Matching.jsx";
import Flashcards from "./games/Flashcards.jsx";
import Quiz from "./games/Quiz.jsx";
import TypeTheWord from "./games/TypeTheWord.jsx";
import SentenceBuilder from "./games/SentenceBuilder.jsx";
import FillTheGap from "./games/FillTheGap.jsx";

// Страница обучения слов
import LearnWords from "./pages/LearnWords.jsx";

/* ---------- Внутренний компонент: главное меню ---------- */
function Menu() {
  const VOCAB = [
    { to: "/matching",   icon: "🧩", title: "Matching",       desc: "Match words to definitions" },
    { to: "/flashcards", icon: "🃏", title: "Flashcards",     desc: "Flip to reveal" },
    { to: "/quiz",       icon: "❓", title: "Quiz",           desc: "Multiple choice" },
    { to: "/type",       icon: "⌨️", title: "Type the Word",  desc: "Type from definition" }
  ];
  const GRAMMAR = [
    { to: "/builder", icon: "🧱", title: "Sentence Builder", desc: "Arrange words to form a sentence" },
    { to: "/fill",    icon: "✍️", title: "Fill the Gap",     desc: "Type the missing word" }
  ];

  return (
    <div className="container max-w-5xl py-6">
      {/* Верхняя панель с кнопкой Learn */}
      <div className="flex justify-end mb-6">
        <Link to="/learn" className="btn">📚 Learn words</Link>
      </div>

      {/* Vocabulary */}
      <h1 className="h1">🎮 Vocabulary Games</h1>
      <p className="sub mt-1">Choose a game to practice the same word list.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {VOCAB.map(g => (
          <Link key={g.to} to={g.to} className="card card-pad text-left hover:bg-slate-50 active:scale-[0.99] transition">
            <div className="text-lg font-semibold">{g.icon} {g.title}</div>
            <div className="sub">{g.desc}</div>
          </Link>
        ))}
      </div>

      {/* Grammar */}
      <h2 className="h1 mt-12">📘 Grammar Games</h2>
      <p className="sub mt-1">Practice sentence structure and grammar rules.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {GRAMMAR.map(g => (
          <Link key={g.to} to={g.to} className="card card-pad text-left hover:bg-slate-50 active:scale-[0.99] transition">
            <div className="text-lg font-semibold">{g.icon} {g.title}</div>
            <div className="sub">{g.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------- Основное приложение с роутами ---------- */
export default function App() {
  const isGamePath = typeof window !== "undefined" && /^(?:\/matching|\/flashcards|\/quiz|\/type|\/builder|\/fill)\b/.test(window.location.pathname);
  const { pairs, source, error, updatedAt } = usePairsData({ shouldPoll: !isGamePath, intervalMs: 30000 });

  const meta = (
    <div className="text-xs text-slate-500">
      Source: <span className="font-mono">{source || "/data.txt"}</span>
      {updatedAt && <> · Updated: {updatedAt.toLocaleTimeString()}</>}
      {error && <> · <span className="text-rose-600">Error: {error}</span></>}
    </div>
  );

  // Обёртка для экранов игр: Back + Learn сверху, meta снизу
  const GameScreen = ({ children }) => (
    <div className="min-h-screen py-6">
      <div className="container mb-4 flex items-center justify-between gap-2">
        <Link to="/" className="btn">← Back to menu</Link>
        <Link to="/learn" className="btn">📚 Learn words</Link>
      </div>

      {children}

      <div className="fixed bottom-3 right-3 bg-white/80 backdrop-blur border rounded-lg px-3 py-2 shadow-sm">
        {meta}
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Главная (меню) */}
        <Route path="/" element={<Menu />} />

        {/* Страница Learn words (отдельный URL) */}
        <Route
          path="/learn"
          element={
            <div className="min-h-screen py-6">
              <div className="container mb-4">
                <Link to="/" className="btn">← Back to menu</Link>
              </div>
              <LearnWords pairs={pairs} onStart={(path)=>{ /* пример: стартовать флешкарты */ }} />
              <div className="fixed bottom-3 right-3 bg-white/80 backdrop-blur border rounded-lg px-3 py-2 shadow-sm">
                {meta}
              </div>
            </div>
          }
        />

        {/* Игры — каждая со своей ссылкой */}
        <Route
          path="/matching"
          element={
            <GameScreen>
              <Matching pairs={pairs} meta={meta} />
            </GameScreen>
          }
        />
        <Route
          path="/flashcards"
          element={
            <GameScreen>
              <Flashcards pairs={pairs} meta={meta} />
            </GameScreen>
          }
        />
        <Route
          path="/quiz"
          element={
            <GameScreen>
              <Quiz pairs={pairs} meta={meta} />
            </GameScreen>
          }
        />
        <Route
          path="/type"
          element={
            <GameScreen>
              <TypeTheWord pairs={pairs} meta={meta} />
            </GameScreen>
          }
        />
        <Route
          path="/builder"
          element={
            <GameScreen>
              <SentenceBuilder meta={meta} />
            </GameScreen>
          }
        />
        <Route
          path="/fill"
          element={
            <GameScreen>
              <FillTheGap meta={meta} />
            </GameScreen>
          }
        />
      </Routes>
    </Router>
  );
}
