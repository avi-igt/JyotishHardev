/**
 * JyotishHardev logomark — a Vedic astrology wheel (Jyotish Chakra).
 *
 * Structure:
 *   outer ring  — 12 tick marks representing the 12 rashis
 *   inner ring  — connected by 4 axis spokes to the outer ring
 *   4 star dots — at cardinal points on the inner ring
 *   bindu       — central filled gold dot (the self / atman)
 */

interface LogoProps {
  size?: number;
  color?: string;
}

export default function Logo({ size = 32, color = '#c9a84c' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="JyotishHardev logo"
    >
      {/* Outer ring */}
      <circle cx="24" cy="24" r="21" stroke={color} strokeWidth="1.5" />

      {/* 12 tick marks — one per rashi, rotated around center */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1="24" y1="3"
          x2="24" y2="7"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${i * 30} 24 24)`}
        />
      ))}

      {/* 4 axis spokes from inner ring to outer ring */}
      {/* Top */}
      <line x1="24" y1="12" x2="24" y2="4" stroke={color} strokeWidth="1" opacity="0.55" />
      {/* Right */}
      <line x1="36" y1="24" x2="44" y2="24" stroke={color} strokeWidth="1" opacity="0.55" />
      {/* Bottom */}
      <line x1="24" y1="36" x2="24" y2="44" stroke={color} strokeWidth="1" opacity="0.55" />
      {/* Left */}
      <line x1="12" y1="24" x2="4" y2="24" stroke={color} strokeWidth="1" opacity="0.55" />

      {/* Inner ring */}
      <circle cx="24" cy="24" r="12" stroke={color} strokeWidth="1" opacity="0.7" />

      {/* 4 star dots at cardinal points on the inner ring */}
      <circle cx="24" cy="12" r="2"   fill={color} />
      <circle cx="36" cy="24" r="2"   fill={color} />
      <circle cx="24" cy="36" r="2"   fill={color} />
      <circle cx="12" cy="24" r="2"   fill={color} />

      {/* Central bindu — the self */}
      <circle cx="24" cy="24" r="3.5" fill={color} />
    </svg>
  );
}
