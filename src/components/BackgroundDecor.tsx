type IconProps = { x: number; y: number; size?: number; rotate?: number };

function Apple({ x, y, size = 64, rotate = 0 }: IconProps) {
  const s = size / 64;
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${s})`} opacity="0.86">
      <line x1="32" y1="12" x2="35" y2="2" stroke="#4E6813" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M35 6 Q46 -2 43 11 Q38 17 35 6Z" fill="#4E6813"/>
      <path d="M32 14 Q28 6 22 10 Q8 14 8 32 Q8 52 20 60 Q26 64 32 62 Q38 64 44 60 Q56 52 56 32 Q56 14 42 10 Q36 6 32 14Z" fill="#74070E"/>
      <ellipse cx="21" cy="30" rx="4" ry="9" fill="white" opacity="0.18" transform="rotate(-15,21,30)"/>
    </g>
  );
}

function Atom({ x, y, size = 72, rotate = 0 }: IconProps) {
  const s = size / 72;
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${s})`} opacity="0.80">
      <ellipse cx="36" cy="36" rx="34" ry="13" fill="none" stroke="#1c0a0b" strokeWidth="3"/>
      <ellipse cx="36" cy="36" rx="34" ry="13" fill="none" stroke="#1c0a0b" strokeWidth="3" transform="rotate(60,36,36)"/>
      <ellipse cx="36" cy="36" rx="34" ry="13" fill="none" stroke="#1c0a0b" strokeWidth="3" transform="rotate(120,36,36)"/>
      <circle cx="36" cy="36" r="9" fill="#74070E"/>
      <circle cx="70" cy="36" r="5" fill="#74070E"/>
      <circle cx="19" cy="57" r="5" fill="#4E6813"/>
      <circle cx="19" cy="15" r="5" fill="#4E6813"/>
    </g>
  );
}

function Globe({ x, y, size = 68, rotate = 0 }: IconProps) {
  const s = size / 68;
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${s})`} opacity="0.78">
      <circle cx="34" cy="34" r="32" fill="#F0E7DA" stroke="#1c0a0b" strokeWidth="3"/>
      <ellipse cx="34" cy="34" rx="19" ry="32" fill="none" stroke="#1c0a0b" strokeWidth="2"/>
      <line x1="2" y1="34" x2="66" y2="34" stroke="#1c0a0b" strokeWidth="2"/>
      <ellipse cx="34" cy="34" rx="32" ry="12" fill="none" stroke="#1c0a0b" strokeWidth="1.5"/>
      <ellipse cx="34" cy="34" rx="32" ry="22" fill="none" stroke="#1c0a0b" strokeWidth="1.5"/>
      <path d="M17 21 Q24 16 30 22 Q28 30 20 27Z" fill="#74070E" opacity="0.75"/>
      <path d="M38 27 Q46 22 51 31 Q48 40 39 37Z" fill="#74070E" opacity="0.75"/>
      <path d="M18 40 Q27 37 30 46 Q23 51 17 46Z" fill="#4E6813" opacity="0.70"/>
    </g>
  );
}

function GraduationCap({ x, y, size = 76, rotate = 0 }: IconProps) {
  const s = size / 76;
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${s})`} opacity="0.84">
      <path d="M14 32 L14 52 Q38 62 62 52 L62 32 Q38 42 14 32Z" fill="#1c0a0b"/>
      <polygon points="38,6 74,26 38,46 2,26" fill="#74070E"/>
      <polygon points="38,6 74,26 56,36" fill="#8a1014" opacity="0.5"/>
      <line x1="74" y1="26" x2="74" y2="50" stroke="#1c0a0b" strokeWidth="3"/>
      <rect x="69" y="50" width="10" height="14" rx="3" fill="#74070E"/>
    </g>
  );
}

function OpenBook({ x, y, size = 80, rotate = 0 }: IconProps) {
  const s = size / 80;
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${s})`} opacity="0.80">
      <path d="M2 16 Q4 8 11 6 Q23 2 38 10 L38 64 Q22 57 10 60 Q4 62 2 56Z" fill="#F0E7DA" stroke="#1c0a0b" strokeWidth="2.5"/>
      <path d="M78 16 Q76 8 69 6 Q57 2 42 10 L42 64 Q58 57 70 60 Q76 62 78 56Z" fill="#F0E7DA" stroke="#1c0a0b" strokeWidth="2.5"/>
      <path d="M38 10 Q40 7 42 10 L42 64 Q40 67 38 64Z" fill="#74070E"/>
      <line x1="10" y1="23" x2="33" y2="20" stroke="#4E6813" strokeWidth="2" opacity="0.65"/>
      <line x1="10" y1="32" x2="33" y2="29" stroke="#4E6813" strokeWidth="2" opacity="0.65"/>
      <line x1="10" y1="41" x2="31" y2="38" stroke="#4E6813" strokeWidth="2" opacity="0.65"/>
      <line x1="10" y1="50" x2="33" y2="47" stroke="#4E6813" strokeWidth="2" opacity="0.65"/>
      <line x1="47" y1="20" x2="70" y2="23" stroke="#74070E" strokeWidth="2" opacity="0.65"/>
      <line x1="47" y1="29" x2="70" y2="32" stroke="#74070E" strokeWidth="2" opacity="0.65"/>
      <line x1="47" y1="38" x2="68" y2="41" stroke="#74070E" strokeWidth="2" opacity="0.65"/>
      <line x1="47" y1="47" x2="70" y2="50" stroke="#74070E" strokeWidth="2" opacity="0.65"/>
    </g>
  );
}

function StackedBooks({ x, y, size = 74, rotate = 0 }: IconProps) {
  const s = size / 74;
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${s})`} opacity="0.84">
      <rect x="2" y="54" width="70" height="18" rx="4" fill="#2a3c0a"/>
      <rect x="2" y="54" width="9" height="18" rx="4" fill="#1e2c08"/>
      <rect x="10" y="54" width="62" height="18" rx="3" fill="#4E6813"/>
      <rect x="5" y="34" width="64" height="20" rx="4" fill="#120608"/>
      <rect x="5" y="34" width="9" height="20" rx="4" fill="#0a0405"/>
      <rect x="13" y="34" width="56" height="20" rx="3" fill="#1c0a0b"/>
      <rect x="9" y="14" width="56" height="20" rx="4" fill="#5a0509"/>
      <rect x="9" y="14" width="9" height="20" rx="4" fill="#3d0609"/>
      <rect x="17" y="14" width="48" height="20" rx="3" fill="#74070E"/>
      <rect x="22" y="17" width="18" height="6" rx="2" fill="white" opacity="0.13"/>
    </g>
  );
}

function Rocket({ x, y, size = 58, rotate = 0 }: IconProps) {
  const s = size / 58;
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${s})`} opacity="0.82">
      <path d="M22 68 Q24 56 29 60 Q29 50 29 46 Q29 50 29 60 Q34 56 36 68" fill="#74070E" opacity="0.85"/>
      <path d="M17 44 L17 26 Q17 6 29 1 Q41 6 41 26 L41 44Z" fill="#1c0a0b"/>
      <path d="M17 26 Q17 6 29 1 Q41 6 41 26Z" fill="#74070E"/>
      <circle cx="29" cy="29" r="7" fill="#F0E7DA" stroke="#4E6813" strokeWidth="2.5"/>
      <circle cx="29" cy="29" r="3" fill="#4E6813"/>
      <path d="M17 44 L5 58 L17 51Z" fill="#74070E"/>
      <path d="M41 44 L53 58 L41 51Z" fill="#74070E"/>
      <rect x="17" y="44" width="24" height="8" rx="2" fill="#2a1015"/>
    </g>
  );
}

function Lightbulb({ x, y, size = 66, rotate = 0 }: IconProps) {
  const s = size / 66;
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${s})`} opacity="0.80">
      <path d="M33 6 Q53 6 55 27 Q57 38 47 49 Q45 53 45 57 L21 57 Q21 53 19 49 Q9 38 11 27 Q13 6 33 6Z" fill="#F0E7DA" stroke="#1c0a0b" strokeWidth="2.5"/>
      <path d="M33 10 Q49 10 51 28 Q52 37 44 47 L22 47 Q14 37 15 28 Q17 10 33 10Z" fill="#74070E" opacity="0.20"/>
      <path d="M24 39 Q28 32 33 39 Q38 32 42 39" fill="none" stroke="#74070E" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="21" y="57" width="24" height="5" rx="2" fill="#1c0a0b"/>
      <rect x="23" y="62" width="20" height="5" rx="2" fill="#1c0a0b"/>
      <line x1="21" y1="59.5" x2="45" y2="59.5" stroke="#F0E7DA" strokeWidth="0.8" opacity="0.4"/>
    </g>
  );
}

function Pencil({ x, y, size = 84, rotate = 0 }: IconProps) {
  const s = size / 84;
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${s})`} opacity="0.76">
      <rect x="15" y="0" width="18" height="11" rx="3" fill="#e8a0a0"/>
      <rect x="15" y="11" width="18" height="5" fill="#c8a85c"/>
      <rect x="13" y="16" width="22" height="54" fill="#74070E"/>
      <rect x="13" y="16" width="6" height="54" fill="#8a1014"/>
      <rect x="29" y="16" width="6" height="54" fill="#5a0509"/>
      <polygon points="13,70 35,70 24,84" fill="#d4a870"/>
      <polygon points="19,78 29,78 24,86" fill="#4E6813"/>
    </g>
  );
}

function Clock({ x, y, size = 68, rotate = 0 }: IconProps) {
  const s = size / 68;
  const marks = [0,30,60,90,120,150,180,210,240,270,300,330];
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${s})`} opacity="0.78">
      <circle cx="34" cy="34" r="32" fill="#F0E7DA" stroke="#1c0a0b" strokeWidth="3.5"/>
      {marks.map((deg, i) => {
        const a = (deg - 90) * Math.PI / 180;
        const r1 = i % 3 === 0 ? 20 : 23;
        return <line key={deg}
          x1={34 + r1 * Math.cos(a)} y1={34 + r1 * Math.sin(a)}
          x2={34 + 28 * Math.cos(a)} y2={34 + 28 * Math.sin(a)}
          stroke="#1c0a0b" strokeWidth={i % 3 === 0 ? 3 : 1.5}/>;
      })}
      <line x1="34" y1="34" x2="22" y2="14" stroke="#1c0a0b" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="34" y1="34" x2="50" y2="24" stroke="#74070E" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="34" cy="34" r="4" fill="#74070E"/>
    </g>
  );
}

export default function BackgroundDecor() {
  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.30 }}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <filter id="drop" x="-25%" y="-25%" width="160%" height="160%">
          <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="#1c0a0b" floodOpacity="0.18"/>
        </filter>
      </defs>

      {/* Верхний ряд */}
      <g filter="url(#drop)"><Apple           x={28}   y={18}  size={74} rotate={-12}/></g>
      <g filter="url(#drop)"><Atom            x={175}  y={6}   size={80} rotate={6}  /></g>
      <g filter="url(#drop)"><Globe           x={688}  y={4}   size={76} rotate={0}  /></g>
      <g filter="url(#drop)"><GraduationCap   x={1270} y={4}   size={82} rotate={-10}/></g>
      <g filter="url(#drop)"><Rocket          x={1388} y={2}   size={62} rotate={-32}/></g>

      {/* Левый край */}
      <g filter="url(#drop)"><Lightbulb       x={4}    y={355} size={74} rotate={5}  /></g>
      <g filter="url(#drop)"><StackedBooks    x={8}    y={602} size={76} rotate={-6} /></g>

      {/* Правый край */}
      <g filter="url(#drop)"><Clock           x={1388} y={325} size={70} rotate={8}  /></g>
      <g filter="url(#drop)"><OpenBook        x={1308} y={582} size={84} rotate={-10}/></g>

      {/* Нижний ряд */}
      <g filter="url(#drop)"><Pencil          x={48}   y={734} size={84} rotate={20} /></g>
      <g filter="url(#drop)"><Atom            x={430}  y={814} size={74} rotate={-8} /></g>
      <g filter="url(#drop)"><OpenBook        x={672}  y={808} size={80} rotate={6}  /></g>
      <g filter="url(#drop)"><StackedBooks    x={998}  y={802} size={74} rotate={-10}/></g>
      <g filter="url(#drop)"><Apple           x={1368} y={800} size={72} rotate={14} /></g>
    </svg>
  );
}
