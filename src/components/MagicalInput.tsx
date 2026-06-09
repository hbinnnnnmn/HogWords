import type { InputHTMLAttributes } from 'react'

/** Text input with golden magical border styling */
export function MagicalInput({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`magical-input w-full rounded-xl px-4 py-3.5 text-white outline-none placeholder:text-[#666] ${className}`}
    />
  )
}
