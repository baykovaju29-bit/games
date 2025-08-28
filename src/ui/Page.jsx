import React from "react";

export default function Page({ title, subtitle, right, children }) {
  return (
    <div className="container max-w-5xl">
      {(title || right) && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            {title && <h1 className="h1">{title}</h1>}
            {subtitle && <div className="sub mt-1">{subtitle}</div>}
          </div>
          {right && <div className="w-full sm:w-auto sm:shrink-0">{right}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
