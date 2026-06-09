export function FogLayer() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 opacity-40"
      style={{
        background:
          'linear-gradient(to top, rgba(108,99,255,0.15), transparent), radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.08), transparent 70%)',
      }}
      aria-hidden
    />
  )
}
