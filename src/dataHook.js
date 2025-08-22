// src/dataHook.js
import { useEffect, useRef, useState } from "react";

// вспомогательный хэш, чтобы сравнить содержимое без глубоких сравнений
function hashString(s) {
  let h = 0, i = 0, len = s.length;
  while (i < len) { h = (h << 5) - h + s.charCodeAt(i++) | 0; }
  return String(h);
}

export function usePairsData() {
  const [state, setState] = useState({
    pairs: [],       // ВАЖНО: будем сохранять ссылку, если контент не менялся
    source: "/data.txt",
    updatedAt: null,
    error: null,
    hash: null,
  });

  // чтобы не менять ссылку на pairs без необходимости
  const pairsRef = useRef([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/data.txt", { cache: "no-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();

        // парсим пары из data.txt (ожидание: term: definition в каждой строке)
        const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        const freshPairs = lines.map((line, i) => {
          const m = line.split(/\s*[:\-–]\s*/); // term : def
          return { term: m[0] || line, def: m.slice(1).join(": ") || "" , key: `p${i}` };
        });

        const newHash = hashString(JSON.stringify(freshPairs));

        // если содержимое НЕ поменялось — не трогаем ссылку на pairs
        if (!cancelled) {
          if (state.hash === newHash) {
            setState(prev => ({
              ...prev,
              updatedAt: new Date(),
              error: null
            }));
          } else {
            pairsRef.current = freshPairs; // обновляем только при реальном изменении
            setState({
              pairs: pairsRef.current,
              source: "/data.txt",
              updatedAt: new Date(),
              error: null,
              hash: newHash,
            });
          }
        }
      } catch (e) {
        if (!cancelled) {
          setState(prev => ({ ...prev, error: String(e), updatedAt: new Date() }));
        }
      }
    }

    load();

    // ❗ Если хочешь авто-подхват изменений файла — оставь аккуратный интервал.
    // Он НЕ будет менять pairs, если контент тот же.
    const id = setInterval(load, 30000); // раз в 30 сек
    return () => { cancelled = true; clearInterval(id); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // грузим и «наблюдаем», но не меняем ссылку без изменения контента

  return {
    pairs: state.pairs,           // стабильная ссылка между "тиканием" времени
    source: state.source,
    updatedAt: state.updatedAt,
    error: state.error,
  };
}
