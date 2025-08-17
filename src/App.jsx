import React, { useState } from "react";
import Matching from "./games/Matching.jsx";
import Flashcards from "./games/Flashcards.jsx";
import Quiz from "./games/Quiz.jsx";
import Type from "./games/Type.jsx";

export default function App() {
  const [game, setGame] = useState(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-6 font-sans">
      <h1 className="text-4xl font-bold mb-6">🎮 Vocab Games Suite</h1>

      {!game && (
        <div className="grid gap-4">
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600"
            onClick={() => setGame("matching")}
          >
            🔗 Matching
          </button>
          <button
            className="px-6 py-3 bg-green-500 text-white rounded-xl shadow hover:bg-green-600"
            onClick={() => setGame("flashcards")}
          >
            🃏 Flashcards
          </button>
          <button
            className="px-6 py-3 bg-purple-500 text-white rounded-xl shadow hover:bg-purple-600"
            onClick={() => setGame("quiz")}
          >
            ❓ Quiz
          </button>
          <button
            className="px-6 py-3 bg-pink-500 text-white rounded-xl shadow hover:bg-pink-600"
            onClick={() => setGame("type")}
          >
            ⌨️ Type-the-word
          </button>
        </div>
      )}

      {game && (
        <div className="w-full max-w-2xl">
          <button
            className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => setGame(null)}
          >
            ⬅ Back to Menu
          </button>

          {game === "matching" && <Matching />}
          {game === "flashcards" && <Flashcards />}
          {game === "quiz" && <Quiz />}
          {game === "type" && <TypeWord />}
        </div>
      )}
    </div>
  );
}

