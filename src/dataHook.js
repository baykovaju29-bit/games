import { useEffect, useState } from "react";
import { REFRESH_MS, parsePairs, getParam, fetchText } from "./utils";

export function usePairsData() {
  const [raw, setRaw] = useState("");
  const [pairs, setPairs] = useState([]);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setError("");
      const sheet = getParam("sheet");
      const txt = getParam("txt");
      let src = "";
      try {
        if (sheet) {
          src = sheet;
          const csv = await fetchText(sheet);
          const rows = csv.trim().split(/\r?\n/).map(r => r.split(/,|\t/));
          const lines = rows.map(cells => {
            const term = (cells[0] || "").trim();
            const def = (cells[1] || "").trim();
            return term && def ? `${term} — ${def}` : "";
          }).filter(Boolean).join("\n");
          if (active) setRaw(lines);
        } else if (txt) {
          src = txt;
          const t = await fetchText(txt);
          if (active) setRaw(t);
        } else if (window.location.hash.length > 1) {
          src = "(hash)";
          const t = decodeURIComponent(window.location.hash.slice(1));
          if (active) setRaw(t);
        } else {
          src = "/data.txt";
          const t = await fetchText("/data.txt");
          if (active) setRaw(t);
        }
        if (active) {
          setSource(src);
          setUpdatedAt(new Date());
        }
      } catch (e) {
        if (active) setError(String(e.message || e));
      }
    }
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => { active = false; clearInterval(id); };
  }, []);

  useEffect(() => setPairs(parsePairs(raw)), [raw]);

  return { pairs, source, error, updatedAt };
}
