export default function Page({ title, subtitle, right, children }) {
  return (
    <div className="container">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="h1">{title}</h1>
          {subtitle && <p className="sub mt-1">{subtitle}</p>}
        </div>
        {right}
      </header>
      {children}
    </div>
  );
}
