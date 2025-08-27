import React from "react";

export default function Page({ title, subtitle, right, children }) {
  return (
    <div className="container max-w-5xl">
      {(title || right) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h1 className="h1">{title}</h1>}
            {subtitle && <div className="sub mt-1">{subtitle}</div>}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
