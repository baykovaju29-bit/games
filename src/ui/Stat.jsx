export default function Stat({ label, value }) {
  return (
    <div className="card p-3 md:card-pad flex flex-col gap-1">
      <div className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="text-lg sm:text-xl md:text-2xl font-bold">
        {value}
      </div>
    </div>
  );
}
