import React, { useEffect, useMemo, useState } from "react";
import Page from "../ui/Page.jsx";
import Stat from "../ui/Stat.jsx";
import GrammarSetupModal from "../ui/GrammarSetupModal.jsx";
import { useSentencesSupabase } from "../hooks/useSentencesSupabase";
import { recordResult } from "../lib/progress";

const norm = (s = "") =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9'-\s]/gi, "").replace(/\s+/g, " ").trim();

const STOP = new Set(["the","a","an","and","or","but","to","in","on","at","for","of","with","by","as","is","are","am","was","were","be","been","being"]);

const SAMPLE_SENTENCES = [
  "If I won the lottery, I would buy a house.",
  "She is writing a letter.",
  "I used to play the piano.",
  "The cake was eaten before we arrived.",
  "There are many books on the shelf."
];

function chooseGapWord(sentence) {
  const tokens = sentence.split(/\s+/).filter(Boolean);
  const candidates = tokens.filter(w => {
    const clean = norm(w).replace(/['-]/g, "");
    return clean.length >= 3 && !STOP.has(clean);
  });
  const pool = candidates.length ? candidates : tokens;
  return pool[Math.floor(Math.random() * pool.length)];
}

function renderGap(sentence, gap) {
  let used = false;
  const parts = sentence.split(/(\s+)/);
  return parts.map((p, idx) => {
    if (!used && norm(p) && norm(p) === norm(gap)) {
      used = true;
      return <span key={idx} className="inline-flex items-center px-2 py-1 rounded-lg border bg-amber-50 border-amber-200 mx-0.5">___</span>;
    }
    return <span key={idx}>{p}</span>;
  });
}

export default function FillTheGap({ meta, pairs = [] }) {
  const [filters, setFilters] = useState({ construction: "conditional_2" });
  const [showModal, setShowModal] = useState(true);
  const [deck, setDeck] = useState([]);
  const [i, setI] = useState(0);
  const [gap, setGap] = useState("");
  const [value, setValue] = useState("");
  const [madeMistake, setMadeMistake] = useState(false);

  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [okFlash, setOkFlash] = useState(false);
  const [shake, setShake] = useState(false);
  const [msg, setMsg] = useState("");

  const accuracy = answered ? Math.round((score / answered) * 100) + "%" : "—";

  // Fetch sentences from Supabase with filters
  const { rows: supabaseRows, loading, error } = useSentencesSupabase({ ...filters, limit: 50 });

  // Use Supabase data or fallback to sample
  const sentences = useMemo(() => {
    if (supabaseRows.length > 0) {
      return supabaseRows.map(r => ({ sentence: r.text, tense: r.tense, aspect: r.aspect, voice: r.voice, construction: r.construction }));
    }
    return SAMPLE_SENTENCES.map(s => ({ sentence: s, tense: "unknown", aspect: "unknown", voice: "unknown", construction: "unknown" }));
  }, [supabaseRows]);

  useEffect(() => {
    setDeck(sentences);
  }, [sentences]);

  useEffect(() => { setMadeMistake(false); setValue(""); setMsg(""); }, [i]);

  const current = deck[i] || {};
  const masked = useMemo(() => current.sentence ? renderGap(current.sentence, gap) : null, [current, gap]);

  function next() {
    if (!deck.length) return;
    const ni = Math.floor(Math.random() * deck.length);
    setI(ni);
    setGap(chooseGapWord(deck[ni].sentence));
    setValue("");
    setMadeMistake(false);
    setOkFlash(false);
    setShake(false);
    setMsg("");
  }

  function check() {
    if (!gap) return;
    const correct = norm(value) === norm(gap);
    const term = gap;
    setAnswered(n => n + 1);

    if (correct) {
      setScore(s => s + 1);
      setStreak(st => st + 1);
      setMsg("✅ Correct");
      setOkFlash(true);
      recordResult({ term, correct: true, firstTry: !madeMistake, game: "fill" });
      setTimeout(() => setOkFlash(false), 400);
      setTimeout(next, 600);
    } else {
      setStreak(0);
      setMsg("❌ Try again");
      setShake(true);
      setMadeMistake(true);
      recordResult({ term, correct: false, firstTry: false, game: "fill" });
      setTimeout(() => setShake(false), 300);
    }
  }

  function hint() {
    if (!gap) return;
    const n = (value || "").length + 1;
    setValue(gap.slice(0, n));
  }

  function reveal() {
    setValue(gap);
  }

  if (loading) {
    return <div className="p-6">Loading sentences...</div>;
  }

  if (!deck.length) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="mb-4">No sentences found with current filters.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            ⚙️ Change Settings
          </button>
        </div>
        {showModal && (
          <GrammarSetupModal
            open={showModal}
            initial={filters}
            onClose={() => setShowModal(false)}
            onApply={(newFilters) => {
              setFilters(newFilters);
              setShowModal(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <Page 
      title="Fill the Gap" 
      subtitle="Type the missing word to complete the sentence."
      right={
        <button className="btn" onClick={() => setShowModal(true)}>
          ⚙️ Settings
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 mb-6">
        <Stat label="Items" value={deck.length} />
        <Stat label="Score" value={score} />
        <Stat label="Streak" value={streak} />
        <Stat label="Accuracy" value={accuracy} />
      </div>

      <div className="card card-pad sub mb-3"><strong>Tense:</strong> {current.tense || "—"}</div>

      <div className={"card card-pad text-lg mb-3 " + (shake ? "animate-shake" : "")}>
        {masked}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder="Type the missing word…"
          className="flex-1 card px-3 py-2 outline-none"
        />
        <div className="flex gap-2">
          <button type="button" className="btn" onClick={hint}>Hint</button>
          <button type="button" className="btn" onClick={reveal}>Reveal</button>
          <button type="button" className={"btn btn-primary " + (okFlash ? "flash-success" : "")} onClick={check} disabled={!value.trim()}>
            Check
          </button>
          <button type="button" className="btn" onClick={next}>Skip</button>
        </div>
      </div>

      {msg && <div className="text-center mt-2 sub">{msg}</div>}
      <div className="mt-4">{meta}</div>
      
      {showModal && (
        <GrammarSetupModal
          open={showModal}
          initial={filters}
          onClose={() => setShowModal(false)}
          onApply={(newFilters) => {
            setFilters(newFilters);
            setShowModal(false);
            setI(0);
            setValue("");
            setMadeMistake(false);
            setMsg("");
          }}
        />
      )}
    </Page>
  );
}
