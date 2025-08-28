// src/pages/Auth.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [session, setSession] = useState(null);
  const [busy, setBusy] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Default to login mode
  const navigate = useNavigate();
  const loc = useLocation();
  const redirectPath = useMemo(() => {
    const params = new URLSearchParams(loc.search || "");
    const requested = params.get("redirect");
    let r = requested && requested.startsWith("/") ? requested : "/home";
    if (r === "/learn") r = "/home";
    return r;
  }, [loc.search]);

  // Подписываемся на изменения сессии — сразу видно, вошли или нет
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // After successful login, redirect to intended route (or home)
  useEffect(() => {
    if (session) {
      navigate(redirectPath, { replace: true });
    }
  }, [session, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return; // prevent double submission
    console.log('🔐 Form submitted!', { email, pass, isSignUp });
    setMsg("");
    setBusy(true);
    
    try {
      if (isSignUp) {
        console.log('📝 Attempting sign up...');
        await handleSignUp();
      } else {
        console.log('🔑 Attempting sign in...');
        await handleSignIn();
      }
    } catch (err) {
      console.error('❌ Error in handleSubmit:', err);
      setMsg(`❌ ${err.message || String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  // (removed duplicate click handler to avoid double requests)

  async function handleSignUp() {
    console.log('🚀 Calling supabase.auth.signUp with:', { email, password: pass });
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        emailRedirectTo: `${location.origin}/#/auth`,
        data: { name: name || undefined },
      },
    });
    
    console.log('📧 Sign up response:', { data, error });
    
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
  }

  async function handleSignIn() {
    console.log('🔑 Calling supabase.auth.signInWithPassword with:', { email, password: pass });
    const { data, error } = await supabase.auth.signInWithPassword({
      email, 
      password: pass,
    });
    
    console.log('🔑 Sign in response:', { data, error });
    
    if (error) {
      setMsg(`❌ ${error.message}`);
    } else if (data?.session) {
      setMsg("✅ Signed in.");
    } else {
      setMsg("ℹ️ No session returned.");
    }
  }

  async function signOut() {
    setBusy(true);
    setMsg("");
    await supabase.auth.signOut();
    setBusy(false);
  }

  const clearForm = () => {
    setEmail("");
    setPass("");
    setName("");
    setMsg("");
  };

  return (
    <div className="container max-w-md py-8">
      <h1 className="h1 mb-2">Account</h1>
      <p className="sub mb-4">Create an account or sign in.</p>

      <form className="card card-pad space-y-3" onSubmit={handleSubmit}>
        {isSignUp && (
          <div>
            <label className="sub block">Name (optional)</label>
            <input 
              className="input" 
              value={name} 
              onChange={e => setName(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="sub block">Email</label>
          <input 
            className="input" 
            type="email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
        </div>
        <div>
          <label className="sub block">Password (≥ 6 chars)</label>
          <input 
            className="input" 
            type="password" 
            required 
            minLength={6} 
            value={pass} 
            onChange={e => setPass(e.target.value)} 
          />
        </div>

        <div className="flex gap-2">
          <button 
            type="submit"
            className="btn btn-primary" 
            disabled={busy}
          >
            {isSignUp ? "Create account" : "Log in"}
          </button>
          
          <button 
            type="button"
            className="btn" 
            onClick={() => {
              setIsSignUp(!isSignUp);
              clearForm();
            }}
            disabled={busy}
          >
            {isSignUp ? "Already have an account?" : "Create new account"}
          </button>
          
          {session && (
            <button 
              type="button"
              className="btn" 
              onClick={signOut} 
              disabled={busy}
            >
              Sign out
            </button>
          )}
        </div>

        {msg && (
          <div className={`text-sm mt-2 p-2 rounded ${
            msg.includes("❌") ? "bg-red-50 text-red-700" :
            msg.includes("✅") ? "bg-green-50 text-green-700" :
            "bg-blue-50 text-blue-700"
          }`}>
            {msg}
          </div>
        )}

        <div className="mt-3 text-xs text-slate-500">
          Session: {session ? "active" : "—"}{session && <> · {session.user?.email}</>}
        </div>
      </form>
    </div>
  );
}
