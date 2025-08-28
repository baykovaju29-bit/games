// src/lib/words.js
import { supabase } from "./supabaseClient";

/**
 * Insert a new word for the authenticated user.
 * Returns the inserted row or throws an Error with a helpful message.
 */
export async function insertWord({ word, definition }) {
  if (!word || !definition) {
    throw new Error("Both 'word' and 'definition' are required");
  }

  // Ensure user is authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    throw new Error(`Failed to get user: ${userError.message}`);
  }
  const user = userData?.user;
  if (!user?.id) {
    throw new Error("You must be signed in to insert words");
  }

  // Perform insert with RLS ownership
  const { data, error } = await supabase
    .from("words")
    .insert([{ user_id: user.id, word, definition }])
    .select()
    .single();

  if (error) {
    // Unique violation code is 23505 in Postgres
    if (error.code === "23505") {
      throw new Error("That word already exists for your account");
    }
    throw new Error(error.message);
  }

  return data;
}

/**
 * Fetch all words of the authenticated user, ordered by word.
 */
export async function listWords() {
  const { data, error } = await supabase
    .from("words")
    .select("id, word, definition, created_at, updated_at")
    .order("word", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

