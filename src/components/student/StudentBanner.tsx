"use client";

import { Cat, Fish, Squirrel, Bird } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const LUXURY = new Set(["classic", "emerald", "graphite"]);

const LUXURY_PALETTE: Record<string, { gold: string; goldBorder: string; subtitle: string; name: string }> = {
  classic:  { gold: "#9C7A45", goldBorder: "rgba(156,122,69,0.45)", subtitle: "rgba(196,164,104,0.80)", name: "#EDE0CC" },
  emerald:  { gold: "#C9A668", goldBorder: "rgba(201,166,104,0.45)", subtitle: "rgba(201,166,104,0.80)", name: "#EEF4EB" },
  graphite: { gold: "#C4A468", goldBorder: "rgba(196,164,104,0.45)", subtitle: "rgba(196,164,104,0.80)", name: "#F0EDE8" },
};

// per-theme glyph: [задания, уроки, проверено]
const THEME_GLYPHS: Record<string, [string, string, string]> = {
  ocean:  ["◌", "◆", "✦"],
  forest: ["✿", "◆", "✶"],
  sun:    ["✦", "◎", "✶"],
  neon:   ["◈", "◉", "✦"],
  craft:  ["■", "◆", "✶"],
  kawaii: ["♡", "✿", "✶"],
  sunset: ["◆", "◇", "✶"],
  scene:  ["♪", "✦", "◇"],
};

function wordForm(n: number, forms: [string, string, string]): string {
  const m10 = n % 10, m100 = n % 100;
  if (m100 >= 11 && m100 <= 14) return forms[2];
  if (m10 === 1) return forms[0];
  if (m10 >= 2 && m10 <= 4) return forms[1];
  return forms[2];
}

// ── Per-theme SVG decorations ─────────────────────────────────────────────────

function OceanDecor() {
  return (
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none flex flex-col items-center justify-center" style={{ width: 172 }}>
      {/* Fish */}
      <div className="wb-float flex justify-center" style={{ color: "rgba(255,255,255,0.84)" }}>
        <Fish size={80} strokeWidth={1.2}/>
      </div>
      {/* Waves */}
      <svg viewBox="0 0 172 38" width="172" height="38" style={{ flexShrink: 0, marginTop: 6 }}>
        <path className="wb-wave"
          d="M0 10 Q22 0 44 10 Q66 20 88 10 Q110 0 132 10 Q154 20 172 10"
          stroke="rgba(255,255,255,0.58)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path className="wb-wave-2"
          d="M0 24 Q22 14 44 24 Q66 34 88 24 Q110 14 132 24 Q154 34 172 24"
          stroke="rgba(255,255,255,0.34)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function ForestDecor() {
  return (
    <div className="absolute right-2 top-0 bottom-0 pointer-events-none select-none flex items-center" style={{ width: 108 }}>
      <div className="wb-float flex justify-center w-full" style={{ color: "rgba(255,255,255,0.82)" }}>
        <Squirrel size={88} strokeWidth={1.2}/>
      </div>
    </div>
  );
}

function SunDecor() {
  return (
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none flex items-center" style={{ width: 136 }}>
      <div className="wb-float flex justify-center w-full" style={{ color: "rgba(255,255,255,0.86)" }}>
        <Bird size={84} strokeWidth={1.2}/>
      </div>
    </div>
  );
}

function NeonDecor() {
  return (
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none overflow-hidden" style={{ width: 165 }}>
      {/* Static diagonal beams */}
      <svg viewBox="0 0 165 100" width="165" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="beam1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9060FF" stopOpacity="0"/>
            <stop offset="60%" stopColor="#9060FF" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#9060FF" stopOpacity="0.28"/>
          </linearGradient>
          <linearGradient id="beam2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#40C8FF" stopOpacity="0"/>
            <stop offset="60%" stopColor="#40C8FF" stopOpacity="0.24"/>
            <stop offset="100%" stopColor="#40C8FF" stopOpacity="0.3"/>
          </linearGradient>
          <linearGradient id="beam3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF60B0" stopOpacity="0"/>
            <stop offset="60%" stopColor="#FF60B0" stopOpacity="0.26"/>
            <stop offset="100%" stopColor="#FF60B0" stopOpacity="0.32"/>
          </linearGradient>
        </defs>
        <polygon points="165,0  165,48 55,100  20,100" fill="url(#beam1)"/>
        <polygon points="165,30 165,65 88,100  74,100" fill="url(#beam2)"/>
        <polygon points="165,58 165,84 115,100 105,100" fill="url(#beam3)"/>
      </svg>
      {/* Twinkle sparkles */}
      <svg viewBox="0 0 165 100" width="165" height="100%" className="absolute inset-0" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <g className="wb-twinkle">
          <line x1="28" y1="20" x2="28" y2="30" stroke="white"   strokeWidth="2"   strokeLinecap="round"/>
          <line x1="23" y1="25" x2="33" y2="25" stroke="white"   strokeWidth="2"   strokeLinecap="round"/>
          <circle cx="28" cy="25" r="1.5" fill="white" opacity="0.5"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "0.55s" }}>
          <line x1="58" y1="11" x2="58" y2="21" stroke="#C0A0FF" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="53" y1="16" x2="63" y2="16" stroke="#C0A0FF" strokeWidth="1.8" strokeLinecap="round"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "1.1s" }}>
          <line x1="18" y1="54" x2="18" y2="64" stroke="#80FFFF" strokeWidth="2"   strokeLinecap="round"/>
          <line x1="13" y1="59" x2="23" y2="59" stroke="#80FFFF" strokeWidth="2"   strokeLinecap="round"/>
          <circle cx="18" cy="59" r="1.5" fill="#80FFFF" opacity="0.5"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "0.3s" }}>
          <line x1="44" y1="72" x2="44" y2="80" stroke="#FF80C0" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="40" y1="76" x2="48" y2="76" stroke="#FF80C0" strokeWidth="1.8" strokeLinecap="round"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "1.5s" }}>
          <line x1="38" y1="36" x2="38" y2="42" stroke="#C0A0FF" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="35" y1="39" x2="41" y2="39" stroke="#C0A0FF" strokeWidth="1.2" strokeLinecap="round"/>
        </g>
      </svg>
    </div>
  );
}

function CraftDecor() {
  return (
    <div className="absolute right-0 bottom-0 pointer-events-none select-none overflow-hidden" style={{ width: 152, height: 94 }}>
      <svg viewBox="0 0 152 94" width="152" height="94" xmlns="http://www.w3.org/2000/svg">
        {/* Ground */}
        <rect x="0" y="78" width="152" height="16" fill="rgba(60,100,20,0.84)"/>
        <rect x="0" y="74" width="152" height="4"  fill="rgba(80,145,30,0.84)"/>
        {/* Tree 1 - tall */}
        <rect x="20" y="38"  width="4"  height="36" fill="rgba(100,58,18,0.84)"/>
        <rect x="12" y="38"  width="20" height="32" fill="rgba(45,112,15,0.86)"/>
        <rect x="8"  y="24"  width="28" height="14" fill="rgba(35,96,10,0.86)"/>
        <rect x="12" y="12"  width="20" height="12" fill="rgba(28,82,8,0.86)"/>
        {/* Tree 2 - shorter */}
        <rect x="98"  y="52"  width="4"  height="22" fill="rgba(100,58,18,0.8)"/>
        <rect x="90"  y="50"  width="18" height="24" fill="rgba(45,112,15,0.82)"/>
        <rect x="86"  y="38"  width="26" height="12" fill="rgba(35,96,10,0.82)"/>
        <rect x="90"  y="28"  width="18" height="10" fill="rgba(28,82,8,0.82)"/>
        {/* Ground bricks */}
        <rect x="0"  y="70" width="18" height="4" fill="rgba(140,88,38,0.52)"/>
        <rect x="20" y="70" width="18" height="4" fill="rgba(118,78,28,0.52)"/>
        <rect x="40" y="70" width="18" height="4" fill="rgba(140,88,38,0.52)"/>
        <rect x="60" y="70" width="18" height="4" fill="rgba(118,78,28,0.52)"/>
        {/* Six-pointed pixel stars — twinkle */}
        {/* Star polygon: 12 points, outer r=4, inner r=2, centered 4,4 in 8×8 box */}
        <g className="wb-twinkle" transform="translate(38, 8)">
          <polygon points="4,0 5,2.27 7.46,2 6,4 7.46,6 5,5.73 4,8 3,5.73 0.54,6 2,4 0.54,2 3,2.27"
            fill="rgba(255,255,255,0.58)"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "0.7s" }} transform="translate(61, 2)">
          <polygon points="4,0 5,2.27 7.46,2 6,4 7.46,6 5,5.73 4,8 3,5.73 0.54,6 2,4 0.54,2 3,2.27"
            fill="rgba(255,255,255,0.5)"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "1.3s" }} transform="translate(115, 11)">
          <polygon points="4,0 5,2.27 7.46,2 6,4 7.46,6 5,5.73 4,8 3,5.73 0.54,6 2,4 0.54,2 3,2.27"
            fill="rgba(255,255,255,0.54)"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "0.4s" }} transform="translate(134, 3)">
          <polygon points="4,0 5,2.27 7.46,2 6,4 7.46,6 5,5.73 4,8 3,5.73 0.54,6 2,4 0.54,2 3,2.27"
            fill="rgba(255,255,255,0.4)"/>
        </g>
      </svg>
    </div>
  );
}

function KawaiiDecor() {
  return (
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none flex items-center" style={{ width: 148 }}>
      <div className="relative flex items-center justify-center w-full">
        {/* Cat icon — the clean Lucide version */}
        <div className="wb-float" style={{ color: "rgba(158,62,108,0.80)" }}>
          <Cat size={92} strokeWidth={1.2}/>
        </div>
        {/* Floating hearts */}
        <span className="wb-twinkle absolute" style={{ top: "10%", left: "6%",  fontSize: 22, color: "rgba(232,118,159,0.84)", lineHeight: 1 }}>♡</span>
        <span className="wb-twinkle absolute" style={{ top: "8%",  right: "6%", fontSize: 15, color: "rgba(232,118,159,0.62)", lineHeight: 1, animationDelay: "0.9s" }}>♡</span>
        <span className="wb-twinkle absolute" style={{ bottom: "12%", right: "4%", fontSize: 17, color: "rgba(232,118,159,0.56)", lineHeight: 1, animationDelay: "0.4s" }}>♡</span>
      </div>
    </div>
  );
}

function SakuraDecor() {
  return (
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none" style={{ width: 166 }}>
      <svg viewBox="0 0 166 106" width="166" height="100%"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}>
        {/* Trunk */}
        <path d="M138 107 C132 90 128 74 124 57 C120 44 122 28 127 13"
          stroke="rgba(105,58,78,0.62)" strokeWidth="5" fill="none" strokeLinecap="round"/>
        {/* Main left branch */}
        <path d="M125 63 C112 55 98 51 84 55"
          stroke="rgba(105,58,78,0.56)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        {/* Upper left branch */}
        <path d="M124 47 C114 37 104 29 96 27"
          stroke="rgba(105,58,78,0.52)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Upper right branch */}
        <path d="M126 31 C136 21 147 13 155 8"
          stroke="rgba(105,58,78,0.52)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Lower twig */}
        <path d="M122 74 C110 69 100 67 90 70"
          stroke="rgba(105,58,78,0.42)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Blossom clusters */}
        <circle cx="82"  cy="53" r="12" fill="rgba(255,200,218,0.84)"/>
        <circle cx="76"  cy="59" r="8"  fill="rgba(255,212,226,0.76)"/>
        <circle cx="90"  cy="49" r="10" fill="rgba(255,216,230,0.80)"/>
        <circle cx="79"  cy="62" r="6"  fill="rgba(255,200,218,0.68)"/>
        <circle cx="94"  cy="25" r="11" fill="rgba(255,200,218,0.86)"/>
        <circle cx="103" cy="21" r="8"  fill="rgba(255,212,226,0.76)"/>
        <circle cx="88"  cy="29" r="7"  fill="rgba(255,216,230,0.72)"/>
        <circle cx="155" cy="7"  r="9"  fill="rgba(255,200,218,0.82)"/>
        <circle cx="149" cy="14" r="7"  fill="rgba(255,212,226,0.72)"/>
        <circle cx="88"  cy="68" r="8"  fill="rgba(255,200,218,0.74)"/>
        <circle cx="97"  cy="65" r="5"  fill="rgba(255,216,230,0.62)"/>
        {/* Flying petals — staggered animations */}
        <ellipse cx="22"  cy="34" rx="5.5" ry="3"   transform="rotate(-28 22 34)"  fill="rgba(255,200,218,0.80)" className="wb-petal"/>
        <ellipse cx="46"  cy="16" rx="4.5" ry="2.5" transform="rotate(18 46 16)"   fill="rgba(255,212,226,0.72)" className="wb-petal-2"/>
        <ellipse cx="60"  cy="52" rx="4"   ry="2.2" transform="rotate(-42 60 52)"  fill="rgba(255,200,218,0.74)" className="wb-petal-3"/>
        <ellipse cx="32"  cy="74" rx="5"   ry="2.8" transform="rotate(22 32 74)"   fill="rgba(255,216,230,0.66)" className="wb-petal-4"/>
        <ellipse cx="14"  cy="57" rx="3.5" ry="2"   transform="rotate(-16 14 57)"  fill="rgba(255,200,218,0.58)" className="wb-petal"/>
        <ellipse cx="110" cy="84" rx="4.5" ry="2.5" transform="rotate(32 110 84)"  fill="rgba(255,205,220,0.62)" className="wb-petal-3"/>
        <ellipse cx="68"  cy="90" rx="3.5" ry="2"   transform="rotate(-22 68 90)"  fill="rgba(255,212,226,0.52)" className="wb-petal-2"/>
        <ellipse cx="40"  cy="45" rx="4"   ry="2.2" transform="rotate(10 40 45)"   fill="rgba(255,200,218,0.67)" className="wb-petal-4"/>
        <ellipse cx="52"  cy="83" rx="3"   ry="1.8" transform="rotate(-35 52 83)"  fill="rgba(255,216,230,0.48)" className="wb-petal"/>
      </svg>
    </div>
  );
}

function SceneDecor() {
  return (
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none flex items-center justify-end pr-5" style={{ width: 162 }}>
      <svg viewBox="0 0 86 126" width="76" height="112" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
        {/* Lightstick outer glow — pulsing */}
        <rect x="28" y="28" width="26" height="76" rx="13" fill="rgba(155,75,255,0.15)" className="wb-pulse"/>
        {/* Lightstick body — glows */}
        <rect x="30" y="30" width="22" height="72" rx="11" fill="rgba(158,78,255,0.8)" className="wb-glow-pulse" style={{ color: "#B050FF" }}/>
        {/* Inner highlight streak */}
        <rect x="34" y="36" width="8"  height="58" rx="4" fill="rgba(220,185,255,0.3)"/>
        <rect x="34" y="36" width="4"  height="25" rx="2" fill="rgba(240,210,255,0.2)"/>
        {/* Handle */}
        <rect x="35" y="102" width="16" height="20" rx="4" fill="rgba(35,15,55,0.94)"/>
        {/* Grip band */}
        <rect x="35" y="108" width="16" height="3" fill="rgba(80,40,110,0.7)"/>
        {/* 8-point star on top — pulses */}
        <path d="M41 2 L44 13 L55 9 L47 18 L57 23 L47 25 L50 37 L41 29 L32 37 L35 25 L25 23 L35 18 L27 9 L38 13 Z"
          fill="rgba(255,218,72,0.95)" className="wb-pulse"/>
        {/* Star inner glow */}
        <path d="M41 8 L43 16 L51 13 L45 20 L52 23 L45 25 L47 33 L41 27 L35 33 L37 25 L30 23 L37 20 L31 13 L39 16 Z"
          fill="rgba(255,240,160,0.45)" className="wb-pulse"/>
        {/* Sparkle + */}
        <g className="wb-twinkle">
          <line x1="10" y1="44" x2="10" y2="54" stroke="#FF80C0" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="5"  y1="49" x2="15" y2="49" stroke="#FF80C0" strokeWidth="2.2" strokeLinecap="round"/>
          <circle cx="10" cy="49" r="1.8" fill="#FF80C0" opacity="0.5"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "0.6s" }}>
          <line x1="72" y1="62" x2="72" y2="72" stroke="#80FFFF" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="67" y1="67" x2="77" y2="67" stroke="#80FFFF" strokeWidth="2.2" strokeLinecap="round"/>
          <circle cx="72" cy="67" r="1.8" fill="#80FFFF" opacity="0.5"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "1.15s" }}>
          <line x1="12" y1="87" x2="12" y2="94" stroke="#C0A0FF" strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="8.5" y1="90.5" x2="15.5" y2="90.5" stroke="#C0A0FF" strokeWidth="1.6" strokeLinecap="round"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "0.9s" }}>
          <line x1="68" y1="28" x2="68" y2="34" stroke="#FFD060" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="65" y1="31" x2="71" y2="31" stroke="#FFD060" strokeWidth="1.4" strokeLinecap="round"/>
        </g>
      </svg>
    </div>
  );
}

function ThemeDecor({ theme }: { theme: string }) {
  switch (theme) {
    case "ocean":  return <OceanDecor />;
    case "forest": return <ForestDecor />;
    case "sun":    return <SunDecor />;
    case "neon":   return <NeonDecor />;
    case "craft":  return <CraftDecor />;
    case "kawaii": return <KawaiiDecor />;
    case "sunset": return <SakuraDecor />;
    case "scene":  return <SceneDecor />;
    default:       return null;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StudentBanner({
  name,
  pendingCount,
  lessonsCount,
  checkedCount,
}: {
  name: string;
  pendingCount: number;
  lessonsCount: number;
  checkedCount: number;
}) {
  const { theme } = useTheme();

  if (LUXURY.has(theme)) {
    const pal = LUXURY_PALETTE[theme] ?? LUXURY_PALETTE.classic;

    return (
      <div
        className="relative overflow-hidden rounded-2xl mb-6"
        style={{
          background: "var(--theme-banner-bg)",
          boxShadow: `var(--theme-banner-shadow), inset 0 0 0 1px ${pal.goldBorder}`,
          padding: "clamp(20px, 4vw, 36px) clamp(20px, 5vw, 40px)",
        }}
      >
        {(["tl","tr","bl","br"] as const).map(pos => (
          <div
            key={pos}
            className="absolute w-5 h-5"
            style={{
              top:    pos.startsWith("t") ? 10 : "auto",
              bottom: pos.startsWith("b") ? 10 : "auto",
              left:   pos.endsWith("l")   ? 10 : "auto",
              right:  pos.endsWith("r")   ? 10 : "auto",
              borderTop:    pos.startsWith("t") ? `1px solid ${pal.gold}` : "none",
              borderBottom: pos.startsWith("b") ? `1px solid ${pal.gold}` : "none",
              borderLeft:   pos.endsWith("l")   ? `1px solid ${pal.gold}` : "none",
              borderRight:  pos.endsWith("r")   ? `1px solid ${pal.gold}` : "none",
              opacity: 0.7,
            }}
          />
        ))}

        <div className="relative z-10">
          <p className="text-xs tracking-[0.22em] mb-3"
            style={{ color: pal.subtitle, fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", fontWeight: 500 }}>
            ДОБРО ПОЖАЛОВАТЬ
          </p>
          <h1 className="leading-none mb-5"
            style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontWeight: 600, fontStyle: "italic",
              fontSize: "clamp(2.4rem, 7vw, 3.5rem)",
              color: pal.name, letterSpacing: "-0.01em",
            }}>
            {name}
          </h1>
          <div className="mb-5"
            style={{ height: "1px", background: `linear-gradient(90deg, ${pal.gold}, rgba(0,0,0,0) 80%)`, opacity: 0.5 }}/>
          <div className="flex items-stretch gap-0">
            {[
              { label: "ЗАДАНИЯ",   value: pendingCount },
              { label: "УРОКИ",     value: lessonsCount },
              ...(checkedCount > 0 ? [{ label: "ПРОВЕРЕНО", value: checkedCount }] : []),
            ].map((stat, i, arr) => (
              <div key={stat.label} className="flex items-stretch">
                <div className="pr-5 sm:pr-7">
                  <p className="text-xs tracking-[0.18em] mb-1"
                    style={{ color: pal.subtitle, fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 500 }}>
                    {stat.label}
                  </p>
                  <p className="leading-none"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 600, fontSize: "clamp(1.8rem, 5vw, 2.4rem)", color: pal.name }}>
                    {stat.value}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div className="self-stretch mr-5 sm:mr-7" style={{ width: "1px", background: pal.goldBorder }}/>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Decorated themed banner ───────────────────────────────────────────────────
  const serif   = "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif";
  const isCraft = theme === "craft";
  const nameFont     = isCraft ? "'Press Start 2P', monospace" : serif;
  const nameFontSize = isCraft ? "clamp(0.8rem, 2.2vw, 1rem)" : "clamp(1.65rem, 5vw, 1.9rem)";
  const glyphs = THEME_GLYPHS[theme] ?? ["◆", "◆", "✦"];

  const stats = [
    { glyph: glyphs[0], count: pendingCount,  label: wordForm(pendingCount, ["задание", "задания", "заданий"]) },
    { glyph: glyphs[1], count: lessonsCount,   label: wordForm(lessonsCount,  ["урок",    "урока",   "уроков"]) },
    ...(checkedCount > 0 ? [{ glyph: glyphs[2], count: checkedCount, label: "проверено" }] : []),
  ];

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-5 sm:p-6 mb-6"
      style={{ background: "var(--theme-banner-bg)", boxShadow: "var(--theme-banner-shadow)" }}
    >
      <ThemeDecor theme={theme} />

      <div className="relative z-10" style={{ paddingRight: "clamp(80px, 30%, 185px)" }}>
        {/* Greeting label */}
        <p className="mb-1.5 uppercase"
          style={{
            fontSize: 12, letterSpacing: "1.5px",
            fontFamily: serif, fontWeight: 500,
            color: "var(--theme-banner-subtitle, rgba(255,255,255,0.7))",
          }}>
          Привет,
        </p>

        {/* Name */}
        <h1 className="leading-tight mb-5"
          style={{
            fontSize: nameFontSize,
            fontFamily: nameFont,
            fontStyle: isCraft ? "normal" : "italic",
            fontWeight: isCraft ? 400 : 600,
            color: "var(--theme-banner-name, #fff)",
            textShadow: "0 1px 10px rgba(0,0,0,0.18)",
          }}>
          {name}!
        </h1>

        {/* Premium stat pills */}
        <div className="flex flex-wrap gap-2">
          {stats.map(s => (
            <div
              key={s.label}
              className="flex items-center gap-2"
              style={{
                padding: "7px 13px",
                background: "var(--theme-banner-stat-bg, rgba(255,255,255,0.18))",
                backdropFilter: "blur(6px)",
                borderRadius: "var(--theme-radius, 12px)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              {/* Themed glyph */}
              <span
                style={{
                  fontSize: 15, lineHeight: 1,
                  color: "var(--theme-banner-name, #fff)",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  opacity: 0.88,
                  userSelect: "none",
                }}
              >
                {s.glyph}
              </span>
              {/* Number + label vertical stack */}
              <div>
                <div style={{
                  fontSize: 19, fontWeight: 700, lineHeight: 1,
                  color: "var(--theme-banner-name, #fff)",
                  fontFamily: serif,
                }}>
                  {s.count}
                </div>
                <div style={{
                  fontSize: 9, lineHeight: 1, marginTop: 2,
                  textTransform: "uppercase", letterSpacing: "0.09em",
                  color: "var(--theme-banner-subtitle, rgba(255,255,255,0.62))",
                  fontFamily: "sans-serif",
                }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
