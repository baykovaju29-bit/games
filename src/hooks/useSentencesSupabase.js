import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { parseSentence } from "../lib/grammar/parseSentence";

export function useSentencesSupabase(filters = {}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); 
      setError(null);
      try {
        let q = supabase.from("sentences").select("*").eq("is_active", true);
        
        if (filters.tense) q = q.eq("tense", filters.tense);
        if (filters.aspect) q = q.eq("aspect", filters.aspect);
        if (filters.voice) q = q.eq("voice", filters.voice);
        if (filters.construction) q = q.eq("construction", filters.construction);
        if (filters.difficultyMin != null) q = q.gte("difficulty", filters.difficultyMin);
        if (filters.difficultyMax != null) q = q.lte("difficulty", filters.difficultyMax);
        if (filters.limit) q = q.limit(filters.limit);

        const { data, error } = await q;
        if (error) throw error;

        const withParsed = (data || []).map(r => ({
          ...r,
          autoTags: parseSentence(r.text)
        }));

        if (alive) setRows(withParsed);
      } catch (e) { 
        if (alive) setError(e.message); 
      }
      finally { 
        if (alive) setLoading(false); 
      }
    })();
    return () => { alive = false; };
  }, [JSON.stringify(filters)]);

  return { rows, loading, error };
}
