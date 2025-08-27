import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSession } from "../hooks/useSession";

export default function Auth() {
  const { session, loading } = useSession();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSignIn(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMsg(error.message);
        console.error("signIn error:", error);
      } else {
        setMsg("Signed in.");
      }
    } catch (err) {
      setMsg(String(err?.message || err));
      console.error("signIn catch:", err);
    } finally {
      setBusy(false);
    }
  }

  async function onSignUp(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // redirect обратно на страницу авторизации в твоём SPA (HashRouter)
          emailRedirectTo: `${location.origin}/#/auth`,
        },
      });

      if (error) {
        setMsg(error.message);
        console.error("signUp error:", error);
      } else {
        // Если в Supabase включено подтверждение почты, user сразу НЕ будет авторизован.
        // В этом случае показываем понятное сообщение.
        if (!data.user || data.user?.identities?.length === 0) {
          setMsg(
            "Check your email to confirm the address. After confirming you'll be redirected here."
          );
        } else {
          setMsg("Account created. You can sign in now.");
        }
      }
    } catch (err) {
      setMsg(String(err?.message || err));
      console.error("signUp catch:", err);
    } finally {
      setBusy(false);
    }
  }

  async function onSignOut() {
    setBusy(true);
    setMsg("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setMsg(error.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="text-sm text-slate-600">
          Session:&nbsp;
          {session?.user ? (
            <span className="font-medium">{session.user.email}</span>
          ) : (
            "— not signed in —"
          )}
        </div>
        {session && (
          <button className="btn" onClick={onSignOut} disabled={busy}>
            🚪 Sign out
          </button>
        )}
      </div>

      {!session && (
        <form
          className="max-w-sm card card-pad space-y-3"
          onSubmit={mode === "signin" ? onSignIn : onSignUp}
        >
          <div className="text-lg font-semibold">
            {mode === "signin" ? "Sign in" : "Create account"}
          </div>

          <label className="block">
            <div className="sub">Email</div>
            <input
              className="input w-full"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <div className="sub">Password</div>
            <input
              className="input w-full"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 6 characters"
            />
          </label>

          {msg && <div className="text-amber-700 text-sm">{msg}</div>}

          <div className="flex gap-2">
            <button className="btn btn-primary" disabled={busy} type="submit">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
            </button>
            <button
              className="btn"
              type="button"
              onClick={() =>
                setMode((m) => (m === "signin" ? "signup" : "signin"))
              }
              disabled={busy}
            >
              {mode === "signin" ? "Create account" : "Have account? Sign in"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
