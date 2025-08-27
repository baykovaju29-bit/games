// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn("Supabase ENV missing. URL:", url, "KEY present:", !!key);
}

// ✅ Singleton: переиспользуем один и тот же инстанс между импортами/рендерами
const globalAny = globalThis; // window в браузере / global в SSR
export const supabase =
  globalAny.__SUPABASE_SINGLETON__ ||
  (globalAny.__SUPABASE_SINGLETON__ = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "games-supabase-auth",
    },
  }));
