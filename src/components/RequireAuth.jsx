import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "../hooks/useSession";

export default function RequireAuth({ children }) {
  const { session, loading } = useSession();
  const loc = useLocation();

  if (loading) return <div className="p-6">Loading…</div>;
  if (!session) return <Navigate to={`/auth?redirect=${encodeURIComponent(loc.pathname)}`} replace />;
  return children;
}
