// src/hooks/useSupabasePairs.js
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Loads words from Supabase and exposes them in the same shape as usePairsData:
 *   [{ term, def, key }]
 */
export function useSupabasePairs() {
  const [state, setState] = useState({
    pairs: [],
    source: "supabase: public.words",
    updatedAt: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Ensure we have a session; RLS requires auth
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        if (!session) {
          setState(s => ({ ...s, error: null, pairs: [], updatedAt: new Date() }));
          return;
        }

        const { data, error } = await supabase
          .from("words")
          .select("id, word, definition, created_at, updated_at")
          .order("word", { ascending: true });
        if (error) throw error;

        const pairs = (data || []).map((row, idx) => ({
          term: row.word,
          def: row.definition,
          key: String(row.id ?? idx),
        }));

        if (!cancelled) {
          setState({ pairs, source: "supabase: public.words", updatedAt: new Date(), error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setState(s => ({ ...s, error: e.message || String(e), updatedAt: new Date() }));
        }
      }
    }

    load();

    // Optional: subscribe to changes for live updates
    const channel = supabase.channel("words-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "words" },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return useMemo(() => ({
    pairs: state.pairs,
    source: state.source,
    updatedAt: state.updatedAt,
    error: state.error,
  }), [state]);
}

