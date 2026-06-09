import type { CSSProperties, ReactNode } from 'react'

export function GlassCard({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={`glass-card ${className}`} style={style}>
      {children}
    </div>
  )
}
