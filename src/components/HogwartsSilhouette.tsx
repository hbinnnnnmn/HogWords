export function HogwartsSilhouette() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 right-0 w-[min(55%,720px)] opacity-30"
      viewBox="0 0 400 180"
      fill="none"
      aria-hidden
    >
      <path
        d="M0 180 L40 120 L80 140 L120 90 L160 110 L200 60 L240 100 L280 80 L320 110 L360 95 L400 130 L400 180 Z"
        fill="#1a1535"
      />
      <rect x="185" y="45" width="30" height="55" fill="#2a2348" />
      <polygon points="200,20 170,55 230,55" fill="#2a2348" />
      <rect x="90" y="100" width="20" height="40" fill="#221c3d" />
      <rect x="290" y="95" width="22" height="45" fill="#221c3d" />
      <circle cx="200" cy="72" r="6" fill="#d4af37" opacity="0.6" />
    </svg>
  )
}
