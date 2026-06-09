import { HOUSES } from '../constants/houses'
import type { HogwartsHouse } from '../types'

export function HouseBadge({
  house,
  size = 'md',
}: {
  house: HogwartsHouse
  size?: 'sm' | 'md' | 'lg'
}) {
  const theme = HOUSES[house]
  const sizeClass =
    size === 'lg' ? 'text-5xl' : size === 'sm' ? 'text-xl' : 'text-3xl'

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-1"
      style={{
        background: `${theme.primary}33`,
        border: `1px solid ${theme.accent}66`,
      }}
    >
      <span className={sizeClass}>{theme.emblem}</span>
      <span className="font-display text-sm" style={{ color: theme.accent }}>
        {theme.name}
      </span>
    </div>
  )
}
