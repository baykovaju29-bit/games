// src/lib/progress.js
import { supabase } from "./supabaseClient";

const LOCAL_KEY = "vgs_progress_v1";
const INTERVALS_DAYS = [0, 1, 2, 4, 7, 15];

function nowTs() { return Date.now(); }
function addDays(ts, d) { return ts + d*24*60*60*1000; }

function loadLocalMap() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}; }
  catch { return {}; }
}
function saveLocalMap(map) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
}

// уникальный ID устройства
function getDeviceId() {
  let id = localStorage.getItem("vgs_device_id");
  if (!id) {
    id = crypto?.randomUUID?.() || String(Math.random()).slice(2) + Date.now();
    localStorage.setItem("vgs_device_id", id);
  }
  return id;
}

export function makeIdFromTerm(term) {
  return (term || "").trim().toLowerCase();
}

export function getProgress(term) {
  const id = makeIdFromTerm(term);
  const map = loadLocalMap();
  return map[id] || { attempts:0, correct:0, firstTry:0, box:0, dueAt:0, learned:false, lastGame:null, lastAt:0 };
}
export function getAllProgress() {
  return loadLocalMap();
}
export function resetProgress(term) {
  const id = makeIdFromTerm(term);
  const map = loadLocalMap();
  delete map[id];
  saveLocalMap(map);
  // удалим и из облака (без await — не блокируем UI)
  const device_id = getDeviceId();
  supabase.from("progress").delete().eq("device_id", device_id).eq("term", id);
}
export function markLearned(term, value=true) {
  const p = getProgress(term);
  const box = value ? 5 : Math.min(p.box || 0, 4);
  const next = setProgress(term, { learned: value, box, dueAt: nowTs() });
  // апсерт в облако (без await)
  const device_id = getDeviceId();
  supabase.from("progress").upsert({
    device_id,
    term: makeIdFromTerm(term),
    attempts: next.attempts,
    correct: next.correct,
    first_try: next.firstTry,
    box: next.box,
    due_at: next.dueAt ? new Date(next.dueAt).toISOString() : null,
    learned: next.learned,
    last_game: next.lastGame,
    last_at: new Date(next.lastAt).toISOString(),
  });
  return next;
}

export function setProgress(term, patch) {
  const id = makeIdFromTerm(term);
  const map = loadLocalMap();
  const curr = map[id] || { attempts:0, correct:0, firstTry:0, box:0, dueAt:0, learned:false, lastGame:null, lastAt:0 };
  const next = { ...curr, ...patch };
  map[id] = next;
  saveLocalMap(map);
  return next;
}

// главный вход: фиксируем результат ответа
export async function recordResult({ term, correct, firstTry=false, game="unknown" }) {
  const id = makeIdFromTerm(term);
  const map = loadLocalMap();
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

  // локально — сразу
  map[id] = next;
  saveLocalMap(map);

  // облако — апсерт (fetch текущего состояния и обновление)
  try {
    const device_id = getDeviceId();

    // читаем существующую строку (если есть)
    const { data: rows, error: selErr } = await supabase
      .from("progress")
      .select("*")
      .eq("device_id", device_id)
      .eq("term", id)
      .limit(1);

    if (selErr) throw selErr;

    if (!rows || rows.length === 0) {
      // вставка
      const { error: insErr } = await supabase.from("progress").insert({
        device_id,
        term: id,
        attempts: attempts,
        correct: correctCount,
        first_try: firstTryCount,
        box,
        due_at: new Date(dueAt).toISOString(),
        learned,
        last_game: game,
        last_at: new Date(next.lastAt).toISOString()
      });
      if (insErr) throw insErr;
    } else {
      // обновление
      const { error: updErr } = await supabase
        .from("progress")
        .update({
          attempts,
          correct: correctCount,
          first_try: firstTryCount,
          box,
          due_at: new Date(dueAt).toISOString(),
          learned,
          last_game: game,
          last_at: new Date(next.lastAt).toISOString()
        })
        .eq("device_id", device_id)
        .eq("term", id);
      if (updErr) throw updErr;
    }
  } catch (e) {
    // в Quick-start просто молча игнорируем ошибку сети — локальный кеш остаётся
    console.warn("Supabase sync failed:", e?.message || e);
  }

  return next;
}

// загрузка облачных данных в локальный кеш (напр., на странице LearnWords)
export async function syncFromCloud() {
  const device_id = getDeviceId();
  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("device_id", device_id);

  if (error) throw error;

  const map = loadLocalMap();
  for (const r of data) {
    const id = r.term;
    map[id] = {
      attempts: r.attempts || 0,
      correct: r.correct || 0,
      firstTry: r.first_try || 0,
      box: r.box || 0,
      dueAt: r.due_at ? new Date(r.due_at).getTime() : 0,
      learned: !!r.learned,
      lastGame: r.last_game || null,
      lastAt: r.last_at ? new Date(r.last_at).getTime() : 0,
    };
  }
  saveLocalMap(map);
  return map;
}
