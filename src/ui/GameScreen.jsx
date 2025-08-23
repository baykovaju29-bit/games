import React from "react";
import { Link } from "react-router-dom";

export default function GameScreen({ children, meta }) {
  return (
    <div className="min-h-screen py-6">
      <div className="container mb-4 flex items-center justify-between gap-2">
        <Link to="/" className="btn">← Back to menu</Link>
        <Link to="/learn" className="btn">📚 Learn words</Link>
      </div>
      {children}
      <div className="fixed bottom-3 right-3 bg-white/80 backdrop-blur border rounded-lg px-3 py-2 shadow-sm">
        {meta}
      </div>
    </div>
  );
}
