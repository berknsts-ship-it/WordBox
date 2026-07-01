"use client";

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
  forest: ["✿", "◆", "★"],
  sun:    ["✦", "◎", "★"],
  neon:   ["◈", "◉", "✦"],
  craft:  ["■", "◆", "★"],
  kawaii: ["♡", "✿", "★"],
  sunset: ["◆", "◇", "★"],
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
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none flex items-center overflow-hidden" style={{ width: 180 }}>
      <svg viewBox="0 0 180 90" width="180" height="90" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
        {/* Fish + bubbles float gently */}
        <g className="wb-float">
          <ellipse cx="118" cy="28" rx="20" ry="10" stroke="rgba(255,255,255,0.68)" strokeWidth="1.5" fill="rgba(255,255,255,0.08)"/>
          <path d="M138 28 L154 17 L154 39 Z" stroke="rgba(255,255,255,0.68)" strokeWidth="1.5" fill="rgba(255,255,255,0.08)" strokeLinejoin="round"/>
          <circle cx="108" cy="25" r="3" fill="rgba(255,255,255,0.7)"/>
          {/* Eye glint */}
          <circle cx="107" cy="24" r="1" fill="rgba(255,255,255,0.95)"/>
          {/* Bubbles */}
          <circle cx="96" cy="13" r="2.2" stroke="rgba(255,255,255,0.42)" strokeWidth="1" fill="rgba(255,255,255,0.06)"/>
          <circle cx="108" cy="6"  r="1.6" stroke="rgba(255,255,255,0.3)"  strokeWidth="1" fill="rgba(255,255,255,0.04)"/>
          <circle cx="86" cy="10" r="1"   stroke="rgba(255,255,255,0.22)" strokeWidth="1" fill="none"/>
        </g>
        {/* Animated waves */}
        <path className="wb-wave"
          d="M0 58 Q22 48 44 58 Q66 68 88 58 Q110 48 132 58 Q154 68 180 58"
          stroke="rgba(255,255,255,0.58)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path className="wb-wave-2"
          d="M0 71 Q22 62 44 71 Q66 80 88 71 Q110 62 132 71 Q154 80 180 71"
          stroke="rgba(255,255,255,0.36)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
        {/* Subtle shimmer line */}
        <path d="M0 82 Q30 78 60 82 Q90 86 120 82 Q150 78 180 82"
          stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function ForestDecor() {
  return (
    <div className="absolute right-3 top-0 bottom-0 pointer-events-none select-none flex items-end" style={{ width: 92 }}>
      {/* overflow: visible so leaves don't clip during sway */}
      <svg viewBox="0 0 80 116" width="80" height="116"
        xmlns="http://www.w3.org/2000/svg"
        className="wb-sway-branch"
        style={{ overflow: "visible" }}>
        {/* Main trunk */}
        <path d="M40 116 C40 94 38 74 36 54 C34 38 42 22 48 7" stroke="rgba(255,255,255,0.72)" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
        {/* Left branch */}
        <path d="M37 70 C26 59 16 56 6 60" stroke="rgba(255,255,255,0.58)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        {/* Right branches */}
        <path d="M40 46 C53 34 63 24 69 12" stroke="rgba(255,255,255,0.58)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d="M38 58 C49 51 57 48 62 52" stroke="rgba(255,255,255,0.46)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        {/* Tiny twig */}
        <path d="M42 32 C50 26 56 22 60 24" stroke="rgba(255,255,255,0.36)" strokeWidth="1" fill="none" strokeLinecap="round"/>
        {/* Leaves */}
        <ellipse cx="4"  cy="57" rx="10" ry="6" transform="rotate(-25 4 57)"  fill="rgba(255,255,255,0.58)"/>
        <ellipse cx="69" cy="10" rx="10" ry="6" transform="rotate(30 69 10)"  fill="rgba(255,255,255,0.58)"/>
        <ellipse cx="50" cy="4"  rx="8"  ry="5" transform="rotate(-10 50 4)"  fill="rgba(255,255,255,0.48)"/>
        <ellipse cx="63" cy="50" rx="8"  ry="4.5" transform="rotate(16 63 50)" fill="rgba(255,255,255,0.46)"/>
        <ellipse cx="42" cy="16" rx="6"  ry="4" transform="rotate(-6 42 16)"  fill="rgba(255,255,255,0.42)"/>
        {/* Small leaf on twig */}
        <ellipse cx="60" cy="22" rx="5"  ry="3" transform="rotate(20 60 22)"  fill="rgba(255,255,255,0.34)"/>
      </svg>
    </div>
  );
}

function SunDecor() {
  return (
    <div className="absolute right-0 top-0 pointer-events-none select-none" style={{ width: 128, height: 130 }}>
      <svg viewBox="0 0 128 130" width="128" height="130" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
        {/* Ray lines */}
        <line x1="82" y1="4"   x2="82" y2="15"  stroke="rgba(255,255,255,0.68)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="120" y1="44" x2="109" y2="44"  stroke="rgba(255,255,255,0.68)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="109" y1="16" x2="101" y2="24"  stroke="rgba(255,255,255,0.56)" strokeWidth="2"   strokeLinecap="round"/>
        <line x1="55"  y1="16" x2="63"  y2="24"  stroke="rgba(255,255,255,0.56)" strokeWidth="2"   strokeLinecap="round"/>
        <line x1="109" y1="72" x2="101" y2="64"  stroke="rgba(255,255,255,0.56)" strokeWidth="2"   strokeLinecap="round"/>
        <line x1="55"  y1="72" x2="63"  y2="64"  stroke="rgba(255,255,255,0.56)" strokeWidth="2"   strokeLinecap="round"/>
        {/* Sun core — pulses */}
        <circle cx="82" cy="44" r="22" fill="rgba(255,255,255,0.22)" className="wb-pulse"/>
        <circle cx="82" cy="44" r="22" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" fill="none" className="wb-pulse"/>
        {/* Inner ring detail */}
        <circle cx="82" cy="44" r="14" stroke="rgba(255,255,255,0.22)" strokeWidth="1" fill="none" className="wb-pulse"/>
        {/* Clouds drift up/down */}
        <g className="wb-float" style={{ animationDelay: "0.8s" }}>
          <path d="M4 78 Q10 70 20 72 Q22 65 32 66 Q40 65 42 72 Q51 70 53 76 Q51 82 42 82 L12 82 Q4 82 4 78 Z"
            stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="rgba(255,255,255,0.2)"/>
        </g>
        <g className="wb-float" style={{ animationDelay: "2s" }}>
          <path d="M0 99 Q5 92 14 94 Q16 87 26 88 Q33 87 35 93 Q43 92 45 97 Q43 102 35 102 L5 102 Q0 102 0 99 Z"
            stroke="rgba(255,255,255,0.36)" strokeWidth="1" fill="rgba(255,255,255,0.14)"/>
        </g>
      </svg>
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
        {/* Pixel stars — twinkle */}
        <g className="wb-twinkle">
          <rect x="40" y="10" width="4" height="4" fill="rgba(255,255,255,0.55)"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "0.7s" }}>
          <rect x="64" y="4"  width="4" height="4" fill="rgba(255,255,255,0.48)"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "1.3s" }}>
          <rect x="118" y="14" width="4" height="4" fill="rgba(255,255,255,0.52)"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "0.4s" }}>
          <rect x="138" y="6"  width="4" height="4" fill="rgba(255,255,255,0.38)"/>
        </g>
      </svg>
    </div>
  );
}

function KawaiiDecor() {
  return (
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none flex items-center" style={{ width: 136 }}>
      <svg viewBox="0 0 118 122" width="118" height="122" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
        {/* Cat face — floats gently */}
        <g className="wb-float">
          <circle cx="58" cy="70" r="33" stroke="rgba(138,58,94,0.55)" strokeWidth="1.6" fill="rgba(255,200,220,0.1)"/>
          {/* Ears */}
          <polygon points="26,50 34,26 43,50" stroke="rgba(138,58,94,0.55)" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
          <polygon points="73,50 82,26 90,50" stroke="rgba(138,58,94,0.55)" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
          {/* Inner ears */}
          <polygon points="30,49 35,30 41,49" fill="rgba(255,160,190,0.42)"/>
          <polygon points="76,49 82,30 88,49" fill="rgba(255,160,190,0.42)"/>
          {/* Eyes — shiny */}
          <ellipse cx="45" cy="66" rx="7" ry="8" stroke="rgba(138,58,94,0.62)" strokeWidth="1.6" fill="rgba(255,200,220,0.1)"/>
          <ellipse cx="71" cy="66" rx="7" ry="8" stroke="rgba(138,58,94,0.62)" strokeWidth="1.6" fill="rgba(255,200,220,0.1)"/>
          <circle cx="47" cy="64" r="2"   fill="rgba(138,58,94,0.65)"/>
          <circle cx="73" cy="64" r="2"   fill="rgba(138,58,94,0.65)"/>
          <circle cx="50" cy="61" r="1.2" fill="rgba(255,255,255,0.8)"/>
          <circle cx="76" cy="61" r="1.2" fill="rgba(255,255,255,0.8)"/>
          {/* Nose */}
          <polygon points="58,76 55,81 61,81" fill="rgba(138,58,94,0.52)"/>
          {/* Mouth */}
          <path d="M52 83 Q58 90 64 83" stroke="rgba(138,58,94,0.46)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
          {/* Whiskers */}
          <line x1="18" y1="77" x2="50" y2="78" stroke="rgba(138,58,94,0.32)" strokeWidth="1"/>
          <line x1="66" y1="78" x2="98" y2="77" stroke="rgba(138,58,94,0.32)" strokeWidth="1"/>
          <line x1="20" y1="83" x2="50" y2="81" stroke="rgba(138,58,94,0.2)"  strokeWidth="1"/>
          <line x1="66" y1="81" x2="96" y2="83" stroke="rgba(138,58,94,0.2)"  strokeWidth="1"/>
          {/* Blush */}
          <ellipse cx="38" cy="74" rx="7" ry="4" fill="rgba(255,130,160,0.22)"/>
          <ellipse cx="78" cy="74" rx="7" ry="4" fill="rgba(255,130,160,0.22)"/>
        </g>
        {/* Floating hearts — twinkle independently */}
        <text x="6"  y="30" fontSize="22" fill="rgba(232,128,159,0.78)" className="wb-twinkle">♡</text>
        <text x="84" y="24" fontSize="15" fill="rgba(232,128,159,0.62)" className="wb-twinkle" style={{ animationDelay: "0.9s" }}>♡</text>
        <text x="98" y="55" fontSize="18" fill="rgba(232,128,159,0.58)" className="wb-twinkle" style={{ animationDelay: "0.4s" }}>♡</text>
      </svg>
    </div>
  );
}

function SunsetDecor() {
  return (
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none overflow-hidden" style={{ width: 158 }}>
      <svg viewBox="0 0 158 102" width="158" height="100%" preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg">
        {/* Mountains — layered for depth */}
        <polygon points="0,102 48,34 96,102"  fill="rgba(80,38,118,0.52)"/>
        <polygon points="30,102 82,22 134,102" fill="rgba(96,48,148,0.62)"/>
        <polygon points="82,102 122,46 158,102" fill="rgba(68,32,98,0.46)"/>
        {/* Sun — pulses */}
        <circle cx="80" cy="30" r="24" fill="rgba(255,200,80,0.3)"  className="wb-pulse"/>
        <circle cx="80" cy="30" r="24" stroke="rgba(255,224,100,0.72)" strokeWidth="2.2" fill="none" className="wb-pulse"/>
        <circle cx="80" cy="30" r="15" stroke="rgba(255,224,100,0.22)" strokeWidth="1" fill="none" className="wb-pulse"/>
        {/* Torii gate */}
        <rect x="112" y="58" width="5"  height="44" fill="rgba(175,30,8,0.9)"/>
        <rect x="131" y="58" width="5"  height="44" fill="rgba(175,30,8,0.9)"/>
        {/* Top crossbar — curved up */}
        <path d="M107 55 Q124 46 151 55" stroke="rgba(175,30,8,0.9)" strokeWidth="5" fill="none" strokeLinecap="round"/>
        {/* Second crossbar */}
        <rect x="109" y="62" width="30" height="4" rx="1" fill="rgba(175,30,8,0.9)"/>
        {/* Short ornament between crossbars */}
        <rect x="124" y="56" width="0" height="0"/>
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
    case "sunset": return <SunsetDecor />;
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
