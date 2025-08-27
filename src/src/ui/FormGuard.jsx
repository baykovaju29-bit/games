import { useEffect } from "react";

export default function FormGuard(){
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); e.stopPropagation(); };
    document.addEventListener("submit", handler, true);
    return () => document.removeEventListener("submit", handler, true);
  }, []);
  return null;
}
