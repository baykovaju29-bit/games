import React, { useState } from "react";
import Matching from "./games/Matching.jsx";
import Flashcards from "./games/Flashcards.jsx";
import Quiz from "./games/Quiz.jsx";
import TypeTheWord from "./games/TypeTheWord.jsx";

function App() {
  const [selected, setSelected] = useState(null);

  if (selected === "matching") return <Matching onBack={() => setSelected(null)} />;
  if (selected === "flashcards") return <Flashcards onBack={() => setSelected(null)} />;
  if (selected === "quiz") return <Quiz onBack={() => setSelected(null)} />;
  if (selected === "type") return <TypeTheWord onBack={() => setSelected(null)} />;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🎮 Vocabulary Games</h1>
      <p>Choose a game:</p>
      <button onClick={() => setSelected("matching")}>🧩 Matching</button>
      <button onClick={() => setSelected("flashcards")}>🃏 Flashcards</button>
      <button onClick={() => setSelected("quiz")}>❓ Quiz</button>
      <button onClick={() => setSelected("type")}>⌨️ Type the Word</button>
    </div>
  );
}

export default App;
