export const REFRESH_MS = 30000;

export function parsePairs(text) {
  const lines = (text || "").split(/\n+/).map(l => l.trim()).filter(Boolean);
  const out = [];
  for (const line of lines) {
    const m = line.split(/\s*[—:-]\s+|,\s+/);
    if (m.length >= 2) {
      const term = m[0].trim();
      const def = m.slice(1).join(" ").trim();
      if (term && def) out.push({ term, def, key: term + "::" + def });
    }
  }
  return out;
}

export function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function secToClock(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const r = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${r}`;
}

export function getParam(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

export async function fetchText(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}
