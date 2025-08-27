import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);
console.log('SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL);
console.log('ANON', (import.meta.env.VITE_SUPABASE_ANON_KEY || '').slice(0, 8) + '...');
