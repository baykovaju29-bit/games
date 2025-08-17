import React from "react";
export default function Matching({ pairs }) {
  return (
    <div>
      <p>Заглушка Matching. Пар: {pairs.length}.</p>
      <ul>{pairs.map(p => <li key={p.term}><b>{p.term}</b> — {p.def}</li>)}</ul>
    </div>
  );
}
