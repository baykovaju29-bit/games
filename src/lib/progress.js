// src/lib/progress.js
const KEY = "vgs_progress_v1";

const INTERVALS_DAYS = [0, 1, 2, 4, 7, 15]; // по номеру коробки

function nowTs() { return Date.now(); }
function addDays(ts, days) { return ts + days*24*60*60*1000; }

function loadMap() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch { return {}; }
}

function saveMap(map) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

// id — стабильный идентификатор слова (желательно term в нижнем регистре)
export function makeIdFromTerm(term) {
  return (term || "").trim().toLowerCase();
}

export function getProgress(term) {
  const id = makeIdFromTerm(term);
  const map = loadMap();
  return map[id] || { attempts:0, correct:0, firstTry:0, box:0, dueAt:0, learned:false, lastGame:null, lastAt:0 };
}

export function setProgress(term, patch) {
  const id = makeIdFromTerm(term);
  const map = loadMap();
  const curr = map[id] || { attempts:0, correct:0, firstTry:0, box:0, dueAt:0, learned:false, lastGame:null, lastAt:0 };
  map[id] = { ...curr, ...patch };
  saveMap(map);
  return map[id];
}

export function recordResult({ term, correct, firstTry=false, game="unknown" }) {
  const id = makeIdFromTerm(term);
  const map = loadMap();
  const curr = map[id] || { attempts:0, correct:0, firstTry:0, box:0, dueAt:0, learned:false, lastGame:null, lastAt:0 };

  const attempts = (curr.attempts||0) + 1;
  const correctCount = (curr.correct||0) + (correct ? 1 : 0);
  const firstTryCount = (curr.firstTry||0) + (correct && firstTry ? 1 : 0);

  let box = curr.box || 0;
  if (correct) box = Math.min(box + 1, 5);
  else box = Math.max(box - 1, 0);

  const dueAt = addDays(nowTs(), INTERVALS_DAYS[box]);
  const learned = box >= 5;

  const next = {
    attempts,
    correct: correctCount,
    firstTry: firstTryCount,
    box,
    dueAt,
    learned,
    lastGame: game,
    lastAt: nowTs()
  };

  map[id] = next;
  saveMap(map);
  return next;
}

// Для списков/фильтров на LearnWords
export function getAllProgress() {
  return loadMap(); // { [id]: progress }
}

export function resetProgress(term) {
  const id = makeIdFromTerm(term);
  const map = loadMap();
  delete map[id];
  saveMap(map);
}

export function markLearned(term, value=true) {
  const p = getProgress(term);
  const box = value ? 5 : Math.min(p.box, 4);
  return setProgress(term, { learned: value, box, dueAt: nowTs() });
}
