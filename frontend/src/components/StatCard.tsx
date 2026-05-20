interface StatCardProps {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
  index?: number;
}

export default function StatCard({ label, value, change, changeLabel, icon, index = 0 }: StatCardProps) {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <div
      className={`glass rounded-2xl p-5 glass-hover transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10 animate-fade-in`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl" role="img" aria-label={label}>{icon}</span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            isNeutral
              ? "bg-slate-500/20 text-slate-400"
              : isPositive
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-emerald-500/20 text-emerald-400"
          }`}
        >
          <svg
            className={`w-3 h-3 ${!isNeutral && !isPositive ? "" : isPositive ? "" : ""} ${
              isPositive ? "" : !isNeutral ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          {Math.abs(change)}%
        </span>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{changeLabel}</p>
    </div>
  );
}
