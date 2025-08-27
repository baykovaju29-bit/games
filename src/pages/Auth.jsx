import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import Page from "../ui/Page.jsx";

export default function Auth() {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const redirect = new URLSearchParams(location.search).get("redirect") || "/";
        navigate(redirect, { replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, location.search]);

  async function signIn(e) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    setBusy(false);
  }

  async function signUp(e) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMsg(error.message);
    else setMsg("Check your email to confirm (if confirmations enabled).");
    setBusy(false);
  }

  return (
    <Page title={mode === "signin" ? "Sign in" : "Create account"} subtitle="">
      <form className="max-w-md mx-auto card card-pad space-y-3" onSubmit={mode === "signin" ? signIn : signUp}>
        <label className="block">
          <div className="sub mb-1">Email</div>
          <input className="input w-full" type="email" autoComplete="email"
                 value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label className="block">
          <div className="sub mb-1">Password</div>
          <input className="input w-full" type="password" autoComplete={mode==="signin"?"current-password":"new-password"}
                 value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </label>

        {msg && <div className="text-sm text-amber-700">{msg}</div>}

        <div className="flex gap-2">
          <button disabled={busy} className="btn btn-primary" type="submit">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
          <button type="button" className="btn" onClick={() => setMode(m => m === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Create account" : "Have an account? Sign in"}
          </button>
        </div>
      </form>
    </Page>
  );
}
