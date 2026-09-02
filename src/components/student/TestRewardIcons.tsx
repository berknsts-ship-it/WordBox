"use client";

import { useEffect, useId, useState } from "react";

const ANIM_CSS = `
@keyframes reward-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes reward-bounce{0%,100%{transform:translateY(0) scale(1)}45%{transform:translateY(-14px) scale(1.08)}65%{transform:translateY(-8px) scale(.97)}}
@keyframes reward-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
@keyframes reward-pop{0%{transform:scale(0) rotate(-15deg);opacity:0}70%{transform:scale(1.25) rotate(4deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
`;

function Star({ size, earned = true }: { size: number; earned?: boolean }) {
  const gid = useId();
  const cx = 20, cy = 20.5, Ro = 17, Ri = 6.6;
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (-90 + i * 36) * Math.PI / 180;
    const r = i % 2 === 0 ? Ro : Ri;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3c4"/>
          <stop offset="45%" stopColor="#f7c948"/>
          <stop offset="100%" stopColor="#c2760a"/>
        </linearGradient>
        <radialGradient id={`${gid}-glare`} cx="38%" cy="28%" r="45%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".95"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy="35.5" rx="8.5" ry="1.6" fill="#000" opacity={earned ? .16 : 0}/>
      <polygon points={pts}
        fill={earned ? `url(#${gid}-fill)` : "none"}
        stroke={earned ? "#a15a06" : "#c2760a"}
        strokeWidth={earned ? .9 : 1.4}
        strokeLinejoin="round"/>
      {earned && <polygon points={pts} fill={`url(#${gid}-glare)`}/>}
    </svg>
  );
}

function Crystal({ size, earned = true }: { size: number; earned?: boolean }) {
  const gid = useId();
  const outer = "12,8 28,8 34,14 34,26 28,32 12,32 6,26 6,14";
  const mid   = "14.2,11.4 25.8,11.4 30.1,15.7 30.1,24.3 25.8,28.6 14.2,28.6 9.9,24.3 9.9,15.7";
  const inner = "16.6,15 23.4,15 25.9,17.5 25.9,22.5 23.4,25 16.6,25 14.1,22.5 14.1,17.5";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <radialGradient id={`${gid}-glare`} cx="35%" cy="30%" r="45%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".9"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="35.5" rx="9" ry="1.6" fill="#000" opacity={earned ? .16 : 0}/>
      <polygon points={outer}
        fill={earned ? "#065f46" : "none"}
        stroke={earned ? "#043d2b" : "#059669"}
        strokeWidth={earned ? .8 : 1.4}
        strokeLinejoin="round"/>
      {earned && <>
        <polygon points={mid} fill="#10b981" stroke="#065f46" strokeWidth=".6" strokeLinejoin="round"/>
        <polygon points={inner} fill="#6ee7b7" stroke="#10b981" strokeWidth=".5" strokeLinejoin="round"/>
        <polygon points={inner} fill={`url(#${gid}-glare)`}/>
      </>}
    </svg>
  );
}

function KawaiiFace({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="17" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5"/>
      <circle cx="14" cy="17" r="2.5" fill="#1c1917"/>
      <circle cx="26" cy="17" r="2.5" fill="#1c1917"/>
      <circle cx="15" cy="16" r=".9" fill="white"/>
      <circle cx="27" cy="16" r=".9" fill="white"/>
      <path d="M13 25 Q20 31 27 25" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="13" cy="22" r="3" fill="#fca5a5" opacity=".55"/>
      <circle cx="27" cy="22" r="3" fill="#fca5a5" opacity=".55"/>
    </svg>
  );
}

function Microphone({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="14" y="4" width="12" height="18" rx="6" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="1"/>
      <rect x="16" y="6" width="3" height="14" rx="1.5" fill="#c4b5fd" opacity=".5"/>
      <path d="M10 20 Q10 31 20 31 Q30 31 30 20" stroke="#7c3aed" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <line x1="20" y1="31" x2="20" y2="38" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="14" y1="38" x2="26" y2="38" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function Sakura({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {[0, 72, 144, 216, 288].map((a, i) => (
        <ellipse key={i} cx="20" cy="10" rx="5.5" ry="9"
          fill="#fbcfe8" stroke="#f9a8d4" strokeWidth=".8"
          transform={`rotate(${a} 20 20)`}/>
      ))}
      <circle cx="20" cy="20" r="5.5" fill="#fce7f3" stroke="#f472b6" strokeWidth="1.2"/>
      <circle cx="20" cy="20" r="2.2" fill="#f472b6"/>
      {[0, 72, 144, 216, 288].map((a, i) => {
        const rad = (a - 90) * Math.PI / 180;
        return (
          <circle key={i}
            cx={20 + 3.4 * Math.cos(rad)}
            cy={20 + 3.4 * Math.sin(rad)}
            r=".8" fill="#fda4af"/>
        );
      })}
    </svg>
  );
}

function PixelAxe({ size }: { size: number }) {
  const p = size / 10;
  const cells: { x: number; y: number; c: string }[] = [
    { x: 3, y: 1, c: "#d1d5db" }, { x: 4, y: 1, c: "#d1d5db" },
    { x: 2, y: 2, c: "#9ca3af" }, { x: 3, y: 2, c: "#e5e7eb" }, { x: 4, y: 2, c: "#6b7280" },
    { x: 1, y: 3, c: "#9ca3af" }, { x: 2, y: 3, c: "#9ca3af" }, { x: 3, y: 3, c: "#9ca3af" }, { x: 4, y: 3, c: "#6b7280" },
    { x: 2, y: 4, c: "#d1d5db" }, { x: 3, y: 4, c: "#9ca3af" }, { x: 4, y: 4, c: "#6b7280" },
    { x: 5, y: 2, c: "#92400e" }, { x: 5, y: 3, c: "#78350f" }, { x: 5, y: 4, c: "#92400e" },
    { x: 5, y: 5, c: "#78350f" }, { x: 5, y: 6, c: "#92400e" }, { x: 5, y: 7, c: "#78350f" },
    { x: 5, y: 8, c: "#92400e" }, { x: 5, y: 9, c: "#78350f" },
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none"
      style={{ imageRendering: "pixelated" }}>
      {cells.map((r, i) => (
        <rect key={i} x={r.x * p} y={r.y * p} width={p} height={p} fill={r.c}/>
      ))}
    </svg>
  );
}

function Shell({ size, earned = true }: { size: number; earned?: boolean }) {
  const stroke = "#4A7FE0";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M16.5 32 Q20 38 23.5 32 Z"
        fill={earned ? "#EAF1FB" : "none"} stroke={stroke} strokeWidth="1"/>
      <path d="M20 33 L6 14 A14 14 0 0 1 34 14 Z"
        fill={earned ? "#7FC4D4" : "none"} stroke={stroke} strokeWidth={earned ? 1 : 1.6}/>
      {earned && (
        <path d="M20 33 L10 19.3 A10 10 0 0 1 30 19.3 Z" fill="#4A7FE0" opacity=".45"/>
      )}
      {([[10.1, 4.1], [20, 0], [29.9, 4.1]] as const).map(([x, y], i) => (
        <line key={i} x1="20" y1="33" x2={x} y2={y}
          stroke={earned ? "#EAF6FA" : stroke} strokeWidth="1" opacity={earned ? .8 : .5}/>
      ))}
      {earned && <ellipse cx="13" cy="9" rx="2.4" ry="4.6" fill="white" opacity=".4" transform="rotate(-18 13 9)"/>}
    </svg>
  );
}

function Leaf({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 4 C34 8 34 24 20 36 C6 24 6 8 20 4 Z" fill="#9ED1A0" stroke="#3FA66B" strokeWidth="1"/>
      <path d="M20 6 L20 34" stroke="#3FA66B" strokeWidth="1" opacity=".6"/>
      <path d="M20 12 L27 16 M20 18 L28 22 M20 24 L26 27" stroke="#3FA66B" strokeWidth=".8" opacity=".45"/>
      <ellipse cx="15" cy="12" rx="2.4" ry="4" fill="white" opacity=".35" transform="rotate(-25 15 12)"/>
    </svg>
  );
}

function SunBurst({ size }: { size: number }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {rays.map((a, i) => (
        <rect key={i} x="18.5" y="1" width="3" height="8" rx="1.5" fill="#F5C04D"
          transform={`rotate(${a} 20 20)`}/>
      ))}
      <circle cx="20" cy="20" r="10" fill="#FADE9E" stroke="#F5C04D" strokeWidth="1.3"/>
      <circle cx="17" cy="17" r="2" fill="white" opacity=".5"/>
    </svg>
  );
}

function NeonBolt({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      style={{ filter: "drop-shadow(0 0 4px #9B7FE8) drop-shadow(0 0 8px #7C6BE0)" }}>
      <polygon points="22,2 9,22 18,22 15,38 32,16 22,16"
        fill="#9B7FE8" stroke="#E8E6FF" strokeWidth="1"/>
    </svg>
  );
}

function Facet({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <polygon points="20,3 33,16 20,37 7,16" fill="none" stroke="#D4B896" strokeWidth="1.4"/>
      <polygon points="20,3 27,16 13,16" fill="#B08D57" opacity=".5"/>
      <line x1="7" y1="16" x2="33" y2="16" stroke="#D4B896" strokeWidth="1"/>
      <line x1="20" y1="3" x2="20" y2="37" stroke="#D4B896" strokeWidth=".6" opacity=".5"/>
    </svg>
  );
}

const ICON_MAP: Record<string, (props: { size: number }) => React.JSX.Element> = {
  emerald: Crystal,
  kawaii: KawaiiFace,
  scene: Microphone,
  sunset: Sakura,
  craft: PixelAxe,
  ocean: Shell,
  forest: Leaf,
  sun: SunBurst,
  neon: NeonBolt,
  graphite: Facet,
};

function getLoopAnim(themeId: string) {
  if (themeId === "kawaii") return "reward-bounce";
  if (themeId === "craft") return "reward-pulse";
  if (themeId === "neon") return "reward-pulse";
  return "reward-float";
}

export default function TestRewardIcons({
  stars,
  themeId,
  size = 44,
}: {
  stars: number;
  themeId: string;
  size?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const Icon = ICON_MAP[themeId] ?? Star;
  const loopAnim = getLoopAnim(themeId);
  const count = Math.max(1, Math.min(5, stars));

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{ANIM_CSS}</style>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: size * 0.14 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={mounted ? {
            animation: `reward-pop .45s cubic-bezier(.34,1.56,.64,1) ${i * .13}s both, ${loopAnim} 2.8s ease-in-out ${.45 + i * .13}s infinite`,
          } : { opacity: 0 }}>
            <Icon size={size} />
          </div>
        ))}
      </div>
    </>
  );
}
