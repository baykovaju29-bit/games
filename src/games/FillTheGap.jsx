import React, { useEffect, useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import Papa from "papaparse";

// ——— утилиты нормализации
const norm = (s="") =>
  s.toLowerCase()
   .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
   .replace(/[^a-zA-Z0-9'-\s]/g, "") // убираем знаки (для сравнения)
   .replace(/\s+/g, " ").trim();

// кандидаты на маскировку: длина >=3 и не артикли/союзы
const STOP = new Set(["the","a","an","and","or","but","to","in","on","at","for","of","with","by","as","is","are","am","was","were","be","been","being"]);

// выбрать слово для пропуска
function chooseGapWord(sentence) {
  const tokens = sentence.split(/\s+/).filter(Boolean);
  // пытаемся взять содержательное слово
  const candidates = tokens.filter(w => {
    const clean = norm(w).replace(/['-]/g,"");
    return clean.length >= 3 && !STOP.has(clean);
  });
  const word = (candidates.length ? candidates : tokens)[Math.floor(Math.random() * (candidates.length ? candidates.length : tokens.length))];
  return word;
}

// отрисовать предложение с пропуском (одно вхождение)
function renderGap(sentence, gap) {
  let used = false;
  const parts = sentence.split(/(\s+)/); // сохраняем пробелы
  return parts.map((p, idx) => {
    if (!used && norm(p) && norm(p) === norm(gap)) {
      used = true;
      return (
        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-lg border bg-amber-50 border-amber-200 mx-0.5">
          ___
        </span>
      );
    }
    return <span key={idx}>{p}</span>;
  });
}

export default function FillTheGap({ meta }) {
  const [deck, setDeck] = useState([]);
  const [i, setI] = useState(0);

  const [gap, setGap] = useState("");     // слово-ответ
  const [value, setValue] = useState(""); // ввод
  const [hintLevel, setHintLevel] = useState(0);

  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);

  const [okFlash, setOkFlash] = useState(false);
  const [shake, setShake] = useState(false);
  const [msg, setMsg] = useState("");

  // загрузка CSV
  useEffect(() => {
    fetch("/data.csv")
      .then(res => res.text())
      .then(text => {
        const res = Papa.parse(text, { header: true });
        const rows = res.data.filter(r => r && r.sentence && r.sentence.trim());
        setDeck(rows);
        if (rows.length) {
          const first = rows[Math.floor(Math.random()*rows.length)];
          const g = chooseGapWord(first.sentence);
          setI(rows.indexOf(first));
          setGap(g);
        }
      });
  }, []);

  const current = deck[i] || {};
  const masked = useMemo(() => current.sentence ? renderGap(current.sentence, gap) : null, [current, gap]);
  const accuracy = answered > 0 ? Math.round((score/answered)*100) + "%" : "—";

  function resetField() {
    setValue("");
    setHintLevel(0);
    setMsg("");
  }

  function next() {
    if (!deck.length) return;
    const ni = Math.floor(Math.random()*deck.length);
    const g = chooseGapWord(deck[ni].sentence);
    setI(ni);
    setGap(g);
    resetField();
    setShake(false);
    setOkFlash(false);
  }

  function check() {
    if (!gap) return;
    setAnswered(a => a + 1);
    if (norm(value) === norm(gap)) {
      setScore(s => s + 1);
      setStreak(st => st + 1);
      setMsg("✅ Correct");
      setOkFlash(true);
      setTimeout(() => setOkFlash(false), 500);
      setTimeout(() => { setMsg(""); next(); }, 650);
    } else {
      setStreak(0);
      setMsg("❌ Try again");
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
  }

  function hint() {
    if (!gap) return;
    const n = Math.min(gap.length, hintLevel + 1);
    setHintLevel(n);
    setValue(gap.slice(0, n));
  }

  function reveal() {
    setValue(gap);
  }

  if (!deck.length) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <Page title="Fill the Gap" subtitle="Type the missing word to complete the sentence.">
      {/* статы */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 mb-6">
        <Stat label="Items"    value={deck.length} />
        <Stat label="Score"    value={score} />
        <Stat label="Streak"   value={streak} />
        <Stat label="Accuracy" value={accuracy} />
      </div>

      {/* tense */}
      <div className="card card-pad sub mb-3">
        <strong>Tense:</strong> {current.tense || "—"}
      </div>

      {/* предложение с пропуском */}
      <div className={"card card-pad text-lg mb-3 " + (shake ? "animate-shake" : "")}>
        {masked}
      </div>

      {/* поле ввода + действия */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder="Type the missing word…"
          className="flex-1 card px-3 py-2 outline-none"
        />
        <div className="flex gap-2">
          <button className="btn" onClick={hint}>Hint</button>
          <button className="btn" onClick={reveal}>Reveal</button>
          <button
            className={"btn btn-primary " + (okFlash ? "flash-success" : "")}
            onClick={check}
            disabled={!value.trim()}
          >
            Check
          </button>
          <button className="btn" onClick={next}>Skip</button>
        </div>
      </div>

      {msg && <div className="text-center mt-2 sub">{msg}</div>}

      <div className="mt-4">{meta}</div>
    </Page>
  );
}
