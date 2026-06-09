/** HP / Shield bar for Spell Duel combat UI */
export function HealthBar({
  label,
  current,
  max,
  color = 'gold',
  align = 'left',
}: {
  label: string
  current: number
  max: number
  color?: 'gold' | 'red' | 'purple'
  align?: 'left' | 'right'
}) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  const fillClass =
    color === 'red'
      ? 'bg-gradient-to-r from-red-700 to-red-400'
      : color === 'purple'
        ? 'bg-gradient-to-r from-purple-900 to-purple'
        : 'bg-gradient-to-r from-[#b8962e] via-gold to-[#f0d878]'

  return (
    <div className={`flex flex-col gap-1 ${align === 'right' ? 'items-end' : 'items-start'}`}>
      <span className="text-xs text-[#aaa]">{label}</span>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[#1e1b3a]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${fillClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-[#888]">
        {current} / {max}
      </span>
    </div>
  )
}
