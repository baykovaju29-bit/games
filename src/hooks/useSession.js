import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) setSession(data?.session ?? null);
      } catch (_e) {
        if (mounted) setSession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (mounted) {
        setSession(sess);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  return { session, loading };
}
