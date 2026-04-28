export default function MetricCard({
  label,
  value,
  icon: Icon,
  iconBg = 'bg-mubil-50',
  iconText = 'text-mubil-700',
  hint,
  loading,
}) {
  return (
    <div className="card-mubil">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {loading ? (
              <span className="inline-block h-7 w-12 animate-pulse rounded bg-slate-200" />
            ) : (
              value?.toLocaleString('tr-TR') ?? '—'
            )}
          </div>
          {hint && <div className="mt-0.5 text-xs text-slate-400">{hint}</div>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconText}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
