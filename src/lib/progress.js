// src/lib/progress.js
import { supabase } from "./supabaseClient";

const LOCAL_KEY = "vgs_progress_v1";
const INTERVALS_DAYS = [0, 1, 2, 4, 7, 15];

function nowTs() { return Date.now(); }
function addDays(ts, d) { return ts + d * 24 * 60 * 60 * 1000; }

function loadLocalMap() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}; }
  catch { return {}; }
}
function saveLocalMap(map) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
}

export function makeIdFromTerm(term) {
  return (term || "").trim().toLowerCase();
}

// ---------- AUTH HELPERS ----------
async function getUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user?.id ?? null;
}

// получаем { id } слова по term
async function getWordIdByTerm(term) {
  const t = makeIdFromTerm(term);
  const { data, error } = await supabase
    .from("words")
    .select("id, term")
    .ilike("term", t)            // допускаем разные регистры
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

// ---------- PUBLIC API (совместимый с твоим кодом) ----------

export function getProgress(term) {
  const id = makeIdFromTerm(term);
  const map = loadLocalMap();
  return map[id] || {
    attempts: 0,
    correct: 0,
    firstTry: 0,
    box: 0,
    dueAt: 0,
    learned: false,
    lastGame: null,
    lastAt: 0
  };
}

export function getAllProgress() {
  return loadLocalMap();
}

export async function resetProgress(term) {
  // локально
  const id = makeIdFromTerm(term);
  const map = loadLocalMap();
  delete map[id];
  saveLocalMap(map);

  // облако
  const uid = await getUserId();
  if (!uid) return; // офлайн/без входа — ок, просто остаёмся на локальном
  const wordId = await getWordIdByTerm(term);
  if (!wordId) return;

  await supabase.from("progress").upsert({
    user_id: uid,
    word_id: wordId,
    box: 0,
    attempts: 0,
    correct: 0,
    first_try: 0,
    learned: false,
    last_seen: new Date().toISOString(),
    next_due: null
  }, { onConflict: "user_id,word_id" });
}

export async function markLearned(term, value = true) {
  // локально
  const p = getProgress(term);
  const box = value ? 5 : Math.min(p.box || 0, 4);
  const next = setProgress(term, { learned: value, box, dueAt: nowTs() });

  // облако
  const uid = await getUserId();
  if (!uid) return next;
  const wordId = await getWordIdByTerm(term);
  if (!wordId) return next;

  // (необязательно) обновим статус слова
  await supabase.from("words")
    .update({ status: value ? "learned" : "learning" })
    .eq("id", wordId);

  await supabase.from("progress").upsert({
    user_id: uid,
    word_id: wordId,
    attempts: next.attempts,
    correct: next.correct,
    first_try: next.firstTry,
    box: next.box,
    learned: next.learned,
    last_seen: new Date(next.lastAt || Date.now()).toISOString(),
    next_due: next.dueAt ? new Date(next.dueAt).toISOString() : null
  }, { onConflict: "user_id,word_id" });

  return next;
}

export function setProgress(term, patch) {
  const id = makeIdFromTerm(term);
  const map = loadLocalMap();
  const curr = map[id] || {
    attempts: 0,
    correct: 0,
    firstTry: 0,
    box: 0,
    dueAt: 0,
    learned: false,
    lastGame: null,
    lastAt: 0
  };
  const next = { ...curr, ...patch };
  map[id] = next;
  saveLocalMap(map);
  return next;
}

// главный вход: фиксируем результат ответа
export async function recordResult({ term, correct, firstTry = false, game = "unknown" }) {
  const id = makeIdFromTerm(term);
  const map = loadLocalMap();
  const curr = map[id] || {
    attempts: 0,
    correct: 0,
    firstTry: 0,
    box: 0,
    dueAt: 0,
    learned: false,
    lastGame: null,
    lastAt: 0
  };

  const attempts = (curr.attempts || 0) + 1;
  const correctCount = (curr.correct || 0) + (correct ? 1 : 0);
  const firstTryCount = (curr.firstTry || 0) + (correct && firstTry ? 1 : 0);

  let box = curr.box || 0;
  box = correct ? Math.min(box + 1, 5) : Math.max(box - 1, 0);

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

  // локально — сразу
  map[id] = next;
  saveLocalMap(map);

  // облако
  try {
    const uid = await getUserId();
    if (!uid) return next; // без входа — просто работаем в локальном кеше

    const wordId = await getWordIdByTerm(term);
    if (!wordId) return next;

    // upsert по (user_id, word_id)
    await supabase.from("progress").upsert({
      user_id: uid,
      word_id: wordId,
      attempts,
      correct: correctCount,
      first_try: firstTryCount,
      box,
      learned,
      last_seen: new Date(next.lastAt).toISOString(),
      next_due: new Date(dueAt).toISOString()
    }, { onConflict: "user_id,word_id" });
  } catch (e) {
    console.warn("Supabase sync failed:", e?.message || e);
  }

  return next;
}

// загрузка облачных данных в локальный кеш (напр., на странице LearnWords)
export async function syncFromCloud() {
  const uid = await getUserId();
  if (!uid) return loadLocalMap(); // без входа ничего не делаем

  // тянем прогресс и вместе подтягиваем term из words
  const { data, error } = await supabase
    .from("progress")
    .select("user_id, word_id, box, attempts, correct, first_try, learned, last_seen, next_due, words ( term )")
    .eq("user_id", uid);

  if (error) throw error;

  const map = loadLocalMap();
  for (const r of data || []) {
    const term = makeIdFromTerm(r?.words?.term || "");
    if (!term) continue;

    map[term] = {
      attempts: r.attempts || 0,
      correct: r.correct || 0,
      firstTry: r.first_try || 0,
      box: r.box || 0,
      dueAt: r.next_due ? new Date(r.next_due).getTime() : 0,
      learned: !!r.learned,
      lastGame: null, // если хочешь хранить игру — добавь колонку last_game в progress
      lastAt: r.last_seen ? new Date(r.last_seen).getTime() : 0
    };
  }
  saveLocalMap(map);
  return map;
}
