import React, { useState } from "react";
import "./styles/index.css";
import { usePairsData } from "./dataHook";
import Matching from "./games/Matching.jsx";
import Flashcards from "./games/Flashcards.jsx";
import Quiz from "./games/Quiz.jsx";
import TypeTheWord from "./games/TypeTheWord.jsx";

const GAMES = [
  { id: "matching", name: "Matching" },
  { id: "flashcards", name: "Flashcards" },
  { id: "quiz", name: "Quiz" },
  { id: "type", name: "Type the Word" },
];

export default function App() {
  const { pairs, source, error, updatedAt } = usePairsData();
  const [view, setView] = useState("menu");

  const header = (
    <header style={{marginBottom:16}}>
      <h1 style={{fontSize:32, margin:0, textAlign:"center"}}>🎮 Vocabulary Games</h1>
      <p style={{textAlign:"center", margin:"8px 0"}}>Choose a game:</p>
      <p style={{textAlign:"center", fontSize:12, color:"#666"}}>
        Source: <code>{source || "(loading...)"}</code>
        {updatedAt && <> · Updated: {updatedAt.toLocaleTimeString()}</>}
        {error && <> · <span style={{color:"#c00"}}>Error: {error}</span></>}
      </p>
    </header>
  );

  return (
    <div style={{minHeight:"100vh", padding:24, fontFamily:"system-ui"}}>
      {header}

      {view === "menu" && (
        <div style={{display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap"}}>
          {GAMES.map(g => (
            <button key={g.id} onClick={()=>setView(g.id)} style={{padding:"8px 14px"}}>
              {g.name}
            </button>
          ))}
        </div>
      )}

      {view !== "menu" && (
        <div style={{maxWidth:900, margin:"16px auto"}}>
          <button onClick={()=>setView("menu")} style={{marginBottom:12}}>&larr; Back</button>

          {view === "matching"   && <Matching pairs={pairs} />}
          {view === "flashcards" && <Flashcards pairs={pairs} />}
          {view === "quiz"       && <Quiz pairs={pairs} />}
          {view === "type"       && <TypeTheWord pairs={pairs} />}
        </div>
      )}
    </div>
  );
}
