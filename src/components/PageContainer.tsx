import type { ReactNode } from 'react'

export function PageContainer({
  children,
  className = '',
  wide = false,
}: {
  children: ReactNode
  className?: string
  wide?: boolean
}) {
  return (
    <div
      className={`mx-auto w-full px-5 py-6 ${wide ? 'max-w-7xl' : 'max-w-lg'} ${className}`}
    >
      {children}
    </div>
  )
}
