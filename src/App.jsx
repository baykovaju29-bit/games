import React from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./styles/index.css";
import { usePairsData } from "./dataHook.jsx";

import Matching from "./games/Matching.jsx";
import Flashcards from "./games/Flashcards.jsx";
import Quiz from "./games/Quiz.jsx";
import TypeTheWord from "./games/TypeTheWord.jsx";
import SentenceBuilder from "./games/SentenceBuilder.jsx";
import FillTheGap from "./games/FillTheGap.jsx";
import LearnWords from "./pages/LearnWords.jsx";

import GameScreen from "./ui/GameScreen.jsx";
import FormGuard from "./ui/FormGuard.jsx";
import ErrorBoundary from "./ui/ErrorBoundary.jsx";

function Menu(){
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
      <div className="flex justify-end mb-6">
        <Link to="/learn" className="btn">📚 Learn words</Link>
      </div>

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

export default function App(){
  const { pairs, source, error, updatedAt } = usePairsData();

  const meta = (
    <div className="text-xs text-slate-500">
      Source: <span className="font-mono">{source || "/data.txt"}</span>
      {updatedAt && <> · Updated: {updatedAt.toLocaleTimeString()}</>}
      {error && <> · <span className="text-rose-600">Error: {error}</span></>}
    </div>
  );

  return (
    <ErrorBoundary>
      <Router>
        <FormGuard />

        <Routes>
          <Route path="/" element={<Menu />} />
          <Route
            path="/learn"
            element={
              <div className="min-h-screen py-6">
                <div className="container mb-4">
                  <Link to="/" className="btn">← Back to menu</Link>
                </div>
                <LearnWords pairs={pairs} onStart={()=>{}} />
                <div className="fixed bottom-3 right-3 bg-white/80 backdrop-blur border rounded-lg px-3 py-2 shadow-sm">
                  {meta}
                </div>
              </div>
            }
          />

          <Route path="/matching" element={
            <GameScreen meta={meta}><Matching pairs={pairs} meta={meta} /></GameScreen>
          } />
          <Route path="/flashcards" element={
            <GameScreen meta={meta}><Flashcards pairs={pairs} meta={meta} /></GameScreen>
          } />
          <Route path="/quiz" element={
            <GameScreen meta={meta}><Quiz pairs={pairs} meta={meta} /></GameScreen>
          } />
          <Route path="/type" element={
            <GameScreen meta={meta}><TypeTheWord pairs={pairs} meta={meta} /></GameScreen>
          } />
          <Route path="/builder" element={
            <GameScreen meta={meta}><SentenceBuilder meta={meta} /></GameScreen>
          } />
          <Route path="/fill" element={
            <GameScreen meta={meta}><FillTheGap meta={meta} /></GameScreen>
          } />
        </Routes>

        {/* Футер на главной тоже виден */}
        <div className="fixed bottom-3 right-3 bg-white/80 backdrop-blur border rounded-lg px-3 py-2 shadow-sm">
          {meta}
        </div>
      </Router>
    </ErrorBoundary>
  );
}
