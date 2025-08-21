import React, { useState, useEffect } from "react";
import Papa from "papaparse";

export default function SentenceBuilder({ meta }) {
  const [sentences, setSentences] = useState([]);
  const [current, setCurrent] = useState(null);
  const [tiles, setTiles] = useState([]);
  const [answer, setAnswer] = useState([]);

  // загрузка предложений из CSV
  useEffect(() => {
    fetch("/data.csv")
      .then((res) => res.text())
      .then((text) => {
        const result = Papa.parse(text, { header: true });
        setSentences(result.data.filter((row) => row.sentence));
      });
  }, []);

  // выбрать случайное предложение
  const loadSentence = () => {
    if (!sentences.length) return;
    const s = sentences[Math.floor(Math.random() * sentences.length)];
    const words = s.sentence.split(" ").sort(() => Math.random() - 0.5);
    setCurrent(s);
    setTiles(words);
    setAnswer([]);
  };

  useEffect(() => {
    if (sentences.length) loadSentence();
  }, [sentences]);

  const moveTile = (word, fromTiles) => {
    if (fromTiles) {
      setTiles(tiles.filter((w) => w !== word));
      setAnswer([...answer, word]);
    } else {
      setAnswer(answer.filter((w) => w !== word));
      setTiles([...tiles, word]);
    }
  };

  const reset = () => {
    if (!current) return;
    setTiles(current.sentence.split(" ").sort(() => Math.random() - 0.5));
    setAnswer([]);
  };

  const check = () => {
    if (!current) return;
    const isCorrect = answer.join(" ") === current.sentence;
    alert(isCorrect ? "✅ Correct!" : "❌ Try again!");
  };

  const skip = () => {
    loadSentence();
  };

  if (!current) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1 className="h1 mb-4">🧱 Sentence Builder</h1>
      
      {/* поле с тайлами */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="border rounded-lg p-4 min-h-[100px]">
            <div className="flex flex-wrap gap-2">
              {tiles.map((w, i) => (
                <button
                  key={i}
                  onClick={() => moveTile(w, true)}
                  className="px-3 py-2 rounded bg-slate-200 hover:bg-slate-300"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Кнопки справа */}
        <div className="flex flex-col gap-2">
          <button className="btn btn-primary" onClick={reset}>Reset</button>
          <button className="btn btn-primary" onClick={check}>Check</button>
          <button className="btn btn-primary" onClick={skip}>Skip</button>
        </div>
      </div>

      {/* нижнее поле (собранный ответ) */}
      <div className="mt-4 border rounded-lg p-4 min-h-[60px]">
        <div className="flex flex-wrap gap-2">
          {answer.map((w, i) => (
            <button
              key={i}
              onClick={() => moveTile(w, false)}
              className="px-3 py-2 rounded bg-emerald-200 hover:bg-emerald-300"
            >
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
