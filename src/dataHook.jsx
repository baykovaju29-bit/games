// src/dataHook.jsx
import { useEffect, useRef, useState } from "react";

// вспомогательный хэш, чтобы сравнить содержимое без глубоких сравнений
function hashString(s) {
  let h = 0, i = 0, len = s.length;
  while (i < len) {
    h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
  }
  return String(h);
}

// делим по ПЕРВОМУ разделителю среди [: - – —] или таба
function splitOnce(line) {
  const match = line.match(/\s*[:\-–—]\s*|\t/);
  if (!match) return [line, ""];
  const idx = match.index ?? 0;
  const sepLen = match[0].length;
  const left = line.slice(0, idx).trim();
  const right = line.slice(idx + sepLen).trim();
  return [left, right];
}

export function usePairsData() {
  const [state, setState] = useState({
    pairs: [],
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

        // надёжный парсер строк
        const lines = text
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean);

        const freshPairs = lines.map((line, i) => {
          const [term, def] = splitOnce(line);
          return { term, def, key: `p${i}` };
        });

        const newHash = hashString(JSON.stringify(freshPairs));

        if (cancelled) return;

        if (state.hash === newHash) {
          // данные не поменялись — лишний ререндер не нужен
          return;
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
      } catch (e) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            error: String(e?.message || e),
            updatedAt: new Date(),
          }));
        }
      }
    }

    load();

    // если нужно авто-обновление файла — можно включить интервал,
    // но он НЕ будет менять pairs, если контент тот же.
    // const id = setInterval(load, 30000);
    return () => {
      cancelled = true;
      // clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // грузим один раз; ссылку на pairs не трогаем без изменения контента

  return {
    pairs: state.pairs,
    source: state.source,
    updatedAt: state.updatedAt,
    error: state.error,
  };
}
