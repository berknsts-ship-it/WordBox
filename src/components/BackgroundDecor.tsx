export default function BackgroundDecor() {
  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.18 }}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Буква A — левый верх */}
      <text x="40" y="110" fontSize="96" fill="#7c5c3e" fontFamily="Georgia, serif" fontStyle="italic" opacity="0.7">A</text>

      {/* Буква B — правый верх */}
      <text x="1300" y="90" fontSize="80" fill="#b8956a" fontFamily="Georgia, serif" fontStyle="italic">B</text>

      {/* Буква c — центр низ */}
      <text x="680" y="870" fontSize="100" fill="#7c5c3e" fontFamily="Georgia, serif" fontStyle="italic" opacity="0.5">c</text>

      {/* Буква d — левый низ */}
      <text x="30" y="870" fontSize="80" fill="#b8956a" fontFamily="Georgia, serif" fontStyle="italic" opacity="0.55">d</text>

      {/* Книжка — левый низ */}
      <g transform="translate(40, 660) scale(1.8)" opacity="0.75">
        <rect x="0" y="0" width="28" height="36" rx="3" fill="#b8956a" />
        <rect x="4" y="0" width="24" height="36" rx="2" fill="#e8d5b7" />
        <line x1="6" y1="8" x2="24" y2="8" stroke="#b8956a" strokeWidth="1.2" />
        <line x1="6" y1="14" x2="24" y2="14" stroke="#b8956a" strokeWidth="1.2" />
        <line x1="6" y1="20" x2="20" y2="20" stroke="#b8956a" strokeWidth="1.2" />
      </g>

      {/* Книжка — правый низ */}
      <g transform="translate(1340, 750) rotate(10) scale(1.5)" opacity="0.65">
        <rect x="0" y="0" width="28" height="36" rx="3" fill="#b8956a" />
        <rect x="4" y="0" width="24" height="36" rx="2" fill="#e8d5b7" />
        <line x1="6" y1="8" x2="24" y2="8" stroke="#b8956a" strokeWidth="1.2" />
        <line x1="6" y1="14" x2="24" y2="14" stroke="#b8956a" strokeWidth="1.2" />
        <line x1="6" y1="20" x2="18" y2="20" stroke="#b8956a" strokeWidth="1.2" />
      </g>

      {/* Карандаш — правый верх */}
      <g transform="translate(1370, 120) rotate(-30)" opacity="0.75">
        <rect x="0" y="0" width="10" height="56" rx="2" fill="#b8956a" />
        <polygon points="0,56 10,56 5,72" fill="#e8d5b7" />
        <rect x="0" y="0" width="10" height="10" rx="1" fill="#7c5c3e" />
        <line x1="0" y1="10" x2="10" y2="10" stroke="#7c5c3e" strokeWidth="1" />
      </g>

      {/* Карандаш — левый середина */}
      <g transform="translate(55, 440) rotate(18)" opacity="0.6">
        <rect x="0" y="0" width="8" height="46" rx="2" fill="#b8956a" />
        <polygon points="0,46 8,46 4,60" fill="#e8d5b7" />
        <rect x="0" y="0" width="8" height="8" rx="1" fill="#7c5c3e" />
      </g>

      {/* Звёздочка — левый верх */}
      <polygon
        points="180,55 184,68 197,68 187,77 191,90 180,81 169,90 173,77 163,68 176,68"
        fill="#b8956a" opacity="0.6"
      />

      {/* Звёздочка — правый середина */}
      <polygon
        points="1260,380 1263,390 1273,390 1265,397 1268,407 1260,400 1252,407 1255,397 1247,390 1257,390"
        fill="#b8956a" opacity="0.55"
      />

      {/* Маленькие звёздочки */}
      <text x="870" y="55" fontSize="22" fill="#b8956a" opacity="0.75">✦</text>
      <text x="200" y="480" fontSize="16" fill="#b8956a" opacity="0.5">✦</text>
      <text x="1180" y="820" fontSize="20" fill="#b8956a" opacity="0.6">✦</text>

      {/* Линованные строчки — левый край */}
      <g stroke="#e8d5b7" strokeWidth="1.5" opacity="0.9">
        <line x1="0" y1="310" x2="110" y2="310" />
        <line x1="0" y1="326" x2="85" y2="326" />
        <line x1="0" y1="342" x2="120" y2="342" />
      </g>

      {/* Линованные строчки — правый край */}
      <g stroke="#e8d5b7" strokeWidth="1.5" opacity="0.9">
        <line x1="1330" y1="490" x2="1440" y2="490" />
        <line x1="1355" y1="506" x2="1440" y2="506" />
        <line x1="1320" y1="522" x2="1440" y2="522" />
      </g>

      {/* Кружки */}
      <circle cx="350" cy="840" r="6" fill="#b8956a" opacity="0.5" />
      <circle cx="368" cy="840" r="6" fill="#b8956a" opacity="0.4" />
      <circle cx="386" cy="840" r="6" fill="#b8956a" opacity="0.3" />

      <circle cx="1090" cy="55" r="7" fill="#e8d5b7" opacity="0.9" />
      <circle cx="1110" cy="48" r="4" fill="#b8956a" opacity="0.7" />
    </svg>
  );
}
