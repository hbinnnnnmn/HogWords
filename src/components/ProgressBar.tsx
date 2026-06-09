export function ProgressBar({
  value,
  max,
  className = '',
}: {
  value: number
  max: number
  className?: string
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={`progress-track w-full ${className}`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
