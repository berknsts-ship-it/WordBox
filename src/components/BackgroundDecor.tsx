function LetterBlock({ x, y, letter, rotate = 0, size = 64 }: {
  x: number; y: number; letter: string; rotate?: number; size?: number;
}) {
  const r = size * 0.13;
  const fontSize = size * 0.52;
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotate})`} opacity="0.75">
      <rect x={0} y={0} width={size} height={size} rx={r} fill="#e8d5b7" stroke="#b8956a" strokeWidth="2.5" />
      <text
        x={size / 2} y={size * 0.72}
        fontSize={fontSize}
        textAnchor="middle"
        fill="#7c5c3e"
        fontFamily="Georgia, serif"
        fontStyle="italic"
      >{letter}</text>
    </g>
  );
}

function Book({ x, y, rotate = 0, scale = 1 }: { x: number; y: number; rotate?: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotate}) scale(${scale})`} opacity="0.72">
      <rect x="0" y="0" width="44" height="56" rx="4" fill="#b8956a" />
      <rect x="6" y="0" width="38" height="56" rx="3" fill="#e8d5b7" />
      <line x1="10" y1="12" x2="38" y2="12" stroke="#b8956a" strokeWidth="1.8" />
      <line x1="10" y1="20" x2="38" y2="20" stroke="#b8956a" strokeWidth="1.8" />
      <line x1="10" y1="28" x2="30" y2="28" stroke="#b8956a" strokeWidth="1.8" />
      <line x1="10" y1="36" x2="34" y2="36" stroke="#b8956a" strokeWidth="1.8" />
    </g>
  );
}

function Pencil({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotate})`} opacity="0.68">
      <rect x="0" y="0" width="13" height="70" rx="3" fill="#b8956a" />
      <polygon points="0,70 13,70 6.5,88" fill="#e8d5b7" />
      <rect x="0" y="0" width="13" height="13" rx="2" fill="#7c5c3e" />
      <line x1="0" y1="13" x2="13" y2="13" stroke="#7c5c3e" strokeWidth="1.5" />
    </g>
  );
}

function Star({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  const s = size;
  return (
    <polygon
      points={`${x},${y - 14 * s} ${x + 4 * s},${y - 4 * s} ${x + 14 * s},${y - 4 * s} ${x + 6 * s},${y + 3 * s} ${x + 9 * s},${y + 13 * s} ${x},${y + 7 * s} ${x - 9 * s},${y + 13 * s} ${x - 6 * s},${y + 3 * s} ${x - 14 * s},${y - 4 * s} ${x - 4 * s},${y - 4 * s}`}
      fill="#b8956a"
      opacity="0.65"
    />
  );
}

export default function BackgroundDecor() {
  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.22 }}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Верхний левый */}
      <LetterBlock x={40} y={30} letter="A" rotate={-12} size={72} />
      <LetterBlock x={140} y={20} letter="B" rotate={8} size={60} />
      <Star x={250} y={80} size={1.1} />

      {/* Верхний центр */}
      <LetterBlock x={660} y={18} letter="C" rotate={-6} size={68} />
      <Star x={790} y={55} size={0.9} />

      {/* Верхний правый */}
      <Book x={1260} y={20} rotate={-8} scale={1.6} />
      <Pencil x={1400} y={15} rotate={-35} />

      {/* Левый край */}
      <Star x={55} y={320} size={1.3} />
      <LetterBlock x={18} y={460} letter="D" rotate={15} size={66} />
      <g stroke="#e8d5b7" strokeWidth="2" opacity="0.9">
        <line x1="0" y1="560" x2="130" y2="560" />
        <line x1="0" y1="578" x2="100" y2="578" />
        <line x1="0" y1="596" x2="140" y2="596" />
      </g>

      {/* Правый край */}
      <LetterBlock x={1358} y={300} letter="E" rotate={-14} size={66} />
      <Star x={1390} y={460} size={1.2} />
      <g stroke="#e8d5b7" strokeWidth="2" opacity="0.9">
        <line x1="1310" y1="540" x2="1440" y2="540" />
        <line x1="1340" y1="558" x2="1440" y2="558" />
        <line x1="1300" y1="576" x2="1440" y2="576" />
      </g>

      {/* Центр левый */}
      <Book x={320} y={680} rotate={-10} scale={2} />
      <Star x={480} y={780} size={1.0} />

      {/* Центр */}
      <LetterBlock x={660} y={790} letter="F" rotate={5} size={64} />
      <Star x={780} y={820} size={0.85} />

      {/* Центр правый */}
      <Star x={960} y={760} size={1.0} />
      <Book x={1060} y={690} rotate={12} scale={2} />

      {/* Нижний левый */}
      <Pencil x={60} y={720} rotate={22} />
      <LetterBlock x={20} y={820} letter="G" rotate={-8} size={60} />

      {/* Нижний правый */}
      <LetterBlock x={1350} y={800} letter="H" rotate={10} size={64} />
      <Pencil x={1220} y={760} rotate={-18} />

      {/* Рассыпанные кружки */}
      <circle cx="420" cy="50" r="7" fill="#b8956a" opacity="0.5" />
      <circle cx="438" cy="50" r="7" fill="#b8956a" opacity="0.4" />
      <circle cx="456" cy="50" r="7" fill="#b8956a" opacity="0.3" />

      <circle cx="1010" cy="855" r="7" fill="#b8956a" opacity="0.5" />
      <circle cx="1028" cy="855" r="7" fill="#b8956a" opacity="0.4" />
      <circle cx="1046" cy="855" r="7" fill="#b8956a" opacity="0.3" />
    </svg>
  );
}
