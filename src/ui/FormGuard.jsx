import { useEffect } from "react";

/**
 * Глобально предотвращает submit любых форм,
 * чтобы ни один скрытый <form> не мог перезагрузить страницу.
 */
export default function FormGuard() {
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    // перехватываем все submit'ы на стадии capture
    document.addEventListener("submit", handler, true);
    return () => document.removeEventListener("submit", handler, true);
  }, []);
  return null;
}
