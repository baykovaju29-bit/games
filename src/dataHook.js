// src/dataHook.js
import { useEffect, useRef, useState } from "react";

// вспомогательный хэш, чтобы сравнить содержимое без глубоких сравнений
function hashString(s) {
  let h = 0, i = 0, len = s.length;
  while (i < len) { h = (h << 5) - h + s.charCodeAt(i++) | 0; }
  return String(h);
}

export function usePairsData(options = {}) {
  const { shouldPoll = true, intervalMs = 30000 } = options;
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
    let timerId = null;

    async function load() {
      try {
        const res = await fetch("/data.txt", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();

        // --- НОВЫЙ НАДЁЖНЫЙ ПАРСЕР СТРОК ---
        const lines = text
          .split(/\r?\n/)
          .map(s => s.trim())
          .filter(Boolean);

        // делим только по ПЕРВОМУ разделителю среди [: - – —] или таба
        function splitOnce(line) {
          const match = line.match(/\s*[:\-–—]\s*|\t/);
          if (!match) return [line, ""]; // нет разделителя -> дефиниция пустая
          const idx = match.index ?? 0;
          const sepLen = match[0].length;
          const left = line.slice(0, idx).trim();
          const right = line.slice(idx + sepLen).trim();
          return [left, right];
        }

        const freshPairs = lines.map((line, i) => {
          const [term, def] = splitOnce(line);
          return { term, def, key: `p${i}` };
        });
        // --- КОНЕЦ ПАРСЕРА ---

        const newHash = hashString(JSON.stringify(freshPairs));

        // если содержимое НЕ поменялось — не трогаем ссылку на pairs
        if (!cancelled) {
          setState(prev => {
            if (prev.hash === newHash) {
              return {
                ...prev,
                updatedAt: new Date(),
                error: null
              };
            } else {
              pairsRef.current = freshPairs; // обновляем только при реальном изменении
              return {
                pairs: pairsRef.current,
                source: "/data.txt",
                updatedAt: new Date(),
                error: null,
                hash: newHash,
              };
            }
          });
        }
      } catch (e) {
        if (!cancelled) {
          setState(prev => ({ ...prev, error: String(e), updatedAt: new Date() }));
        }
      }
    }

    // Первая загрузка всегда
    load();

    // Авто-подхват изменений файла — только если включён shouldPoll
    if (shouldPoll) {
      timerId = setInterval(load, intervalMs);
    }

    return () => {
      cancelled = true;
      if (timerId) clearInterval(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPoll, intervalMs]); // пересоздаём наблюдение при смене режима

  return {
    pairs: state.pairs,           // стабильная ссылка между "тиканием" времени
    source: state.source,
    updatedAt: state.updatedAt,
    error: state.error,
  };
}
