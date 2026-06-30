export default function WBLogo({ size = 40 }: { size?: number }) {
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
      <circle cx="50" cy="50" r="44" stroke="#9C7A45" strokeWidth="0.9" />
      {/* Inner ring */}
      <circle cx="50" cy="50" r="38.5" stroke="#9C7A45" strokeWidth="0.55" />

      {/* WB monogram */}
      <text
        x="50"
        y="47"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Cormorant Garamond', var(--font-cormorant), Georgia, serif"
        fontWeight="600"
        fontSize="22"
        fill="#4A1414"
        letterSpacing="-0.5"
      >
        WB
      </text>

      {/* Horizontal separator */}
      <line x1="37" y1="58" x2="63" y2="58" stroke="#9C7A45" strokeWidth="0.75" />
      {/* Centre dot on separator */}
      <circle cx="50" cy="58" r="1.5" fill="#9C7A45" />

      {/* Left laurel stem */}
      <path d="M47,63 C38,67 25,72 14,75" stroke="#9C7A45" strokeWidth="0.9" strokeLinecap="round" />
      {/* Left leaves */}
      <line x1="44" y1="64.5" x2="41" y2="67.5" stroke="#9C7A45" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="38" y1="67"   x2="35" y2="70"   stroke="#9C7A45" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="31" y1="69.5" x2="28" y2="72.5" stroke="#9C7A45" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="23" y1="72"   x2="20" y2="75"   stroke="#9C7A45" strokeWidth="0.7" strokeLinecap="round" />

      {/* Right laurel stem (mirror) */}
      <path d="M53,63 C62,67 75,72 86,75" stroke="#9C7A45" strokeWidth="0.9" strokeLinecap="round" />
      {/* Right leaves */}
      <line x1="56" y1="64.5" x2="59" y2="67.5" stroke="#9C7A45" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="62" y1="67"   x2="65" y2="70"   stroke="#9C7A45" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="69" y1="69.5" x2="72" y2="72.5" stroke="#9C7A45" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="77" y1="72"   x2="80" y2="75"   stroke="#9C7A45" strokeWidth="0.7" strokeLinecap="round" />
    </svg>
  );
}
