import React, { useState } from "react";

export default function SentenceBuilder({ meta }) {
  const [words] = useState(["I", "am", "learning", "English"]);
  const [shuffled, setShuffled] = useState([...words].sort(() => Math.random() - 0.5));
  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState(null); // "correct" | "wrong" | null

  const handleWordClick = (word) => {
    if (selected.includes(word)) return; // не даём выбрать повторно
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

  return (
    <div className="container">
      <h1 className="h1 mb-2">🧱 Sentence Builder</h1>
      <p className="sub mb-4">Arrange the shuffled tiles to form a correct sentence.</p>

      {/* собранное предложение */}
      <div className="min-h-[3rem] border rounded-lg px-3 py-2 mb-4 bg-slate-50">
        {selected.join(" ")}
      </div>

      {/* кнопки-слова */}
      <div className="flex flex-wrap gap-2 mb-6">
        {shuffled.map((w, i) => (
          <button
            key={i}
            onClick={() => handleWordClick(w)}
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

      <button
        onClick={handleCheck}
        className="btn btn-primary"
      >
        Check
      </button>

      {/* meta под самой игрой */}
      <div className="mt-6">{meta}</div>
    </div>
  );
}
