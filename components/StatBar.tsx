type StatBarProps = {
  label: string;
  value: number;
  colorClass: string;
  trackClass: string;
};

export function StatBar({ label, value, colorClass, trackClass }: StatBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-street-muted">
        <span>
          {label}: {clamped}%
        </span>
      </div>
      <div className={`h-4 overflow-hidden rounded-sm border border-street-border ${trackClass}`}>
        <div
          className={`h-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
