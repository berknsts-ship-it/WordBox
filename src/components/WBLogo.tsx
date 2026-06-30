export default function WBLogo({
  size = 40,
  ringColor = "#9C7A45",
  textColor = "#4A1414",
}: {
  size?: number;
  ringColor?: string;
  textColor?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Word Box"
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="44" stroke={ringColor} strokeWidth="1.6" />
      {/* Inner ring */}
      <circle cx="50" cy="50" r="38" stroke={ringColor} strokeWidth="0.9" />

      {/* WB monogram */}
      <text
        x="50"
        y="47"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Cormorant Garamond', var(--font-cormorant), Georgia, serif"
        fontWeight="600"
        fontSize="23"
        fill={textColor}
        letterSpacing="-0.5"
      >
        WB
      </text>

      {/* Separator line + dot */}
      <line x1="36" y1="58" x2="64" y2="58" stroke={ringColor} strokeWidth="1.1" />
      <circle cx="50" cy="58" r="2" fill={ringColor} />

      {/* Left laurel stem */}
      <path d="M47,63 C38,67 25,72 14,75" stroke={ringColor} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="44" y1="64.5" x2="40" y2="68"   stroke={ringColor} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="38" y1="67"   x2="34" y2="70.5" stroke={ringColor} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="31" y1="69.5" x2="27" y2="73"   stroke={ringColor} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="23" y1="72"   x2="19" y2="75.5" stroke={ringColor} strokeWidth="1.1" strokeLinecap="round" />

      {/* Right laurel stem */}
      <path d="M53,63 C62,67 75,72 86,75" stroke={ringColor} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="56" y1="64.5" x2="60" y2="68"   stroke={ringColor} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="62" y1="67"   x2="66" y2="70.5" stroke={ringColor} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="69" y1="69.5" x2="73" y2="73"   stroke={ringColor} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="77" y1="72"   x2="81" y2="75.5" stroke={ringColor} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
