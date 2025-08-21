import React, { useState } from "react";

export default function SentenceBuilder({ meta }) {
  const [words, setWords] = useState(["I", "am", "learning", "English"]);
  const [shuffled, setShuffled] = useState([...words].sort(() => Math.random() - 0.5));
  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState(null); // "correct" | "wrong" | null

  const handleWordClick = (word, index) => {
    if (selected.includes(word)) return; // уже выбрали
    setSelected([...selected, word]);
  };

  const handleCheck = () => {
    if (selected.join(" ") === words.join(" ")) {
      setStatus("correct");
      setTimeout(() => setStatus(null), 1000);
    } else {
      setStatus("wrong");
      setTimeout(() => {
        setStatus(null);
        setSelected([]);
      }, 800);
    }
  };

  const handleReset = () => {
    setSelected([]);
    setStatus(null);
  };

  const handleSkip = () => {
    setSelected(words); // показываем правильный ответ
    setStatus("correct");
  };

  return (
    <div className="container">
      <h1 className="h1 mb-4">🧱 Sentence Builder</h1>

      {/* собранное предложение */}
      <div className="min-h-[3rem] border rounded-lg px-3 py-2 mb-4 bg-slate-50">
        {selected.join(" ")}
      </div>

      {/* кнопки-слова */}
      <div className="flex flex-wrap gap-2 mb-6">
        {shuffled.map((w, i) => (
          <button
            key={i}
            onClick={() => handleWordClick(w, i)}
            className={`px-4 py-2 rounded-lg border transition ${
              selected.includes(w)
                ? status === "wrong"
                  ? "bg-red-200 animate-shake"
                  : "bg-slate-200 opacity-60"
                : "bg-white hover:bg-slate-100"
            }`}
          >
            {w}
          </button>
        ))}
      </div>

      {/* кнопки действий */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={handleReset}
          className="flex-1 px-6 py-2 rounded-lg border bg-white hover:bg-slate-100"
        >
          🔄 Reset
        </button>
        <button
          onClick={handleCheck}
          className="flex-1 px-6 py-2 rounded-lg border bg-green-100 hover:bg-green-200"
        >
          ✅ Check
        </button>
        <button
          onClick={handleSkip}
          className="flex-1 px-6 py-2 rounded-lg border bg-yellow-100 hover:bg-yellow-200"
        >
          ⏭️ Skip
        </button>
      </div>

      {/* футер */}
      <div className="mt-6">{meta}</div>
    </div>
  );
}
