// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Better environment variable validation
if (!url || !key) {
  console.error("❌ Supabase environment variables missing!");
  console.error("VITE_SUPABASE_URL:", url ? "✅ Present" : "❌ Missing");
  console.error("VITE_SUPABASE_ANON_KEY:", key ? "✅ Present" : "❌ Missing");
  console.error("Please check your .env file or Vercel environment variables.");
}

// ✅ Singleton: переиспользуем один и тот же инстанс между импортами/рендерами
const globalAny = globalThis; // window в браузере / global в SSR

// Only create client if environment variables are available
export const supabase = (() => {
  if (!url || !key) {
    // Return a mock client that throws errors for better debugging
    return {
      auth: {
        signUp: () => Promise.reject(new Error("Supabase not configured - check environment variables")),
        signInWithPassword: () => Promise.reject(new Error("Supabase not configured - check environment variables")),
        signOut: () => Promise.reject(new Error("Supabase not configured - check environment variables")),
        getSession: () => Promise.reject(new Error("Supabase not configured - check environment variables")),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      }
    };
  }

  return globalAny.__SUPABASE_SINGLETON__ ||
    (globalAny.__SUPABASE_SINGLETON__ = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "games-supabase-auth",
      },
    }));
})();
