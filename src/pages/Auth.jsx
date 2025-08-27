// src/pages/Auth.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg]   = useState("");
  const [session, setSession] = useState(null);
  const [busy, setBusy] = useState(false);

  // Подписываемся на изменения сессии — сразу видно, вошли или нет
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signUp(e) {
    e.preventDefault();
    setMsg(""); setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          emailRedirectTo: `${location.origin}/#/auth`,
          data: { name: name || undefined },
        },
      });
      if (error) {
        setMsg(`❌ ${error.message}`);
      } else if (data?.user && !data?.session) {
        // Подтверждение включено — письма без сессии
        setMsg("📧 Check your email to confirm the address.");
      } else if (data?.session) {
        setMsg("✅ Signed up & logged in.");
      } else {
        setMsg("ℹ️ Sign-up request sent.");
      }
    } catch (err) {
      setMsg(`❌ ${err.message || String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function signIn(e) {
    e.preventDefault();
    setMsg(""); setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email, password: pass,
      });
      if (error) setMsg(`❌ ${error.message}`);
      else if (data?.session) setMsg("✅ Signed in.");
      else setMsg("ℹ️ No session returned.");
    } catch (err) {
      setMsg(`❌ ${err.message || String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true); setMsg("");
    await supabase.auth.signOut();
    setBusy(false);
  }

  return (
    <div className="container max-w-md py-8">
      <h1 className="h1 mb-2">Account</h1>
      <p className="sub mb-4">Create an account or sign in.</p>

      <form className="card card-pad space-y-3" onSubmit={signUp}>
        <div>
          <label className="sub block">Name (optional)</label>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="sub block">Email</label>
          <input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="sub block">Password (≥ 6 chars)</label>
          <input className="input" type="password" required minLength={6} value={pass} onChange={e=>setPass(e.target.value)} />
        </div>

        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={signUp} disabled={busy}>Sign up</button>
          <button className="btn" onClick={signIn} disabled={busy}>Sign in</button>
          {session && <button className="btn" onClick={signOut} disabled={busy}>Sign out</button>}
        </div>

        {msg && <div className="text-sm mt-2">{msg}</div>}

        <div className="mt-3 text-xs text-slate-500">
          Session: {session ? "active" : "—"}{session && <> · {session.user?.email}</>}
        </div>
      </form>
    </div>
  );
}
