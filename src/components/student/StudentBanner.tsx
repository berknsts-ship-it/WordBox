"use client";

import { CalendarDays, ClipboardList, Star } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const LUXURY = new Set(["classic", "emerald", "graphite"]);

const LUXURY_PALETTE: Record<string, { gold: string; goldBorder: string; subtitle: string; name: string }> = {
  classic:  { gold: "#9C7A45", goldBorder: "rgba(156,122,69,0.45)", subtitle: "rgba(196,164,104,0.80)", name: "#EDE0CC" },
  emerald:  { gold: "#C9A668", goldBorder: "rgba(201,166,104,0.45)", subtitle: "rgba(201,166,104,0.80)", name: "#EEF4EB" },
  graphite: { gold: "#C4A468", goldBorder: "rgba(196,164,104,0.45)", subtitle: "rgba(196,164,104,0.80)", name: "#F0EDE8" },
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
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none flex items-center overflow-hidden" style={{ width: 170 }}>
      <svg viewBox="0 0 170 90" width="170" height="90" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="115" cy="28" rx="19" ry="9" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none"/>
        <path d="M134 28 L150 18 L150 38 Z" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
        <circle cx="105" cy="26" r="2.5" fill="rgba(255,255,255,0.65)"/>
        <circle cx="94" cy="14" r="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none"/>
        <circle cx="106" cy="8" r="1.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none"/>
        <circle cx="85" cy="11" r="1" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none"/>
        <path d="M0 60 Q22 50 44 60 Q66 70 88 60 Q110 50 132 60 Q154 70 170 60" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M0 72 Q22 63 44 72 Q66 81 88 72 Q110 63 132 72 Q154 81 170 72" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function ForestDecor() {
  return (
    <div className="absolute right-4 top-0 bottom-0 pointer-events-none select-none flex items-end" style={{ width: 88 }}>
      <svg viewBox="0 0 80 112" width="80" height="112" xmlns="http://www.w3.org/2000/svg" className="wb-sway-branch">
        <path d="M40 112 C40 90 38 72 36 52 C34 36 42 20 48 6" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M37 68 C27 58 17 55 7 59" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M40 44 C52 33 62 23 68 11" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M38 57 C48 50 56 47 62 51" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <ellipse cx="5" cy="56" rx="9" ry="5.5" transform="rotate(-25 5 56)" fill="rgba(255,255,255,0.55)"/>
        <ellipse cx="68" cy="9" rx="9" ry="5.5" transform="rotate(30 68 9)" fill="rgba(255,255,255,0.55)"/>
        <ellipse cx="50" cy="4" rx="7" ry="4.5" transform="rotate(-10 50 4)" fill="rgba(255,255,255,0.45)"/>
        <ellipse cx="63" cy="49" rx="7" ry="4" transform="rotate(15 63 49)" fill="rgba(255,255,255,0.45)"/>
        <ellipse cx="40" cy="16" rx="6" ry="4" transform="rotate(-5 40 16)" fill="rgba(255,255,255,0.4)"/>
      </svg>
    </div>
  );
}

function SunDecor() {
  return (
    <div className="absolute right-0 top-0 pointer-events-none select-none" style={{ width: 120, height: 120 }}>
      <svg viewBox="0 0 120 120" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <line x1="80" y1="4" x2="80" y2="14" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="116" y1="40" x2="106" y2="40" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="105" y1="15" x2="98" y2="22" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="55" y1="15" x2="62" y2="22" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="105" y1="65" x2="98" y2="58" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="55" y1="65" x2="62" y2="58" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="80" cy="40" r="21" fill="rgba(255,255,255,0.2)" className="wb-pulse"/>
        <circle cx="80" cy="40" r="21" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none" className="wb-pulse"/>
        <path d="M4 76 Q9 69 18 71 Q20 64 30 65 Q38 64 40 71 Q49 69 51 74 Q49 79 40 79 L12 79 Q4 79 4 76 Z" stroke="rgba(255,255,255,0.48)" strokeWidth="1" fill="rgba(255,255,255,0.2)"/>
        <path d="M0 96 Q4 90 13 92 Q15 86 24 87 Q31 86 33 91 Q40 90 42 95 Q40 99 33 99 L4 99 Q0 99 0 96 Z" stroke="rgba(255,255,255,0.36)" strokeWidth="1" fill="rgba(255,255,255,0.14)"/>
      </svg>
    </div>
  );
}

function NeonDecor() {
  return (
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none overflow-hidden" style={{ width: 160 }}>
      <svg viewBox="0 0 160 100" width="160" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="160,0 160,45 60,100 28,100" fill="#9060FF" fillOpacity="0.18"/>
        <polygon points="160,32 160,62 92,100 78,100" fill="#40C8FF" fillOpacity="0.2"/>
        <polygon points="160,58 160,82 118,100 108,100" fill="#FF60B0" fillOpacity="0.22"/>
      </svg>
      <svg viewBox="0 0 160 100" width="160" height="100%" className="absolute inset-0" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <g className="wb-twinkle">
          <line x1="28" y1="22" x2="28" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="24" y1="26" x2="32" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "0.6s" }}>
          <line x1="55" y1="12" x2="55" y2="20" stroke="#C0A0FF" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="51" y1="16" x2="59" y2="16" stroke="#C0A0FF" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "1.1s" }}>
          <line x1="18" y1="55" x2="18" y2="63" stroke="#80FFFF" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="14" y1="59" x2="22" y2="59" stroke="#80FFFF" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "0.3s" }}>
          <line x1="42" y1="70" x2="42" y2="78" stroke="#FF80C0" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="38" y1="74" x2="46" y2="74" stroke="#FF80C0" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
      </svg>
    </div>
  );
}

function CraftDecor() {
  return (
    <div className="absolute right-0 bottom-0 pointer-events-none select-none overflow-hidden" style={{ width: 148, height: 90 }}>
      <svg viewBox="0 0 148 90" width="148" height="90" xmlns="http://www.w3.org/2000/svg">
        {/* Ground */}
        <rect x="0" y="74" width="148" height="16" fill="rgba(60,100,20,0.82)"/>
        <rect x="0" y="70" width="148" height="4" fill="rgba(80,140,30,0.82)"/>
        {/* Tree 1 */}
        <rect x="10" y="38" width="16" height="32" fill="rgba(45,110,15,0.85)"/>
        <rect x="6" y="24" width="24" height="14" fill="rgba(35,95,10,0.85)"/>
        <rect x="10" y="14" width="16" height="10" fill="rgba(28,82,8,0.85)"/>
        <rect x="18" y="38" width="4" height="32" fill="rgba(100,58,18,0.82)"/>
        {/* Tree 2 */}
        <rect x="90" y="48" width="14" height="22" fill="rgba(45,110,15,0.8)"/>
        <rect x="86" y="36" width="22" height="12" fill="rgba(35,95,10,0.8)"/>
        <rect x="90" y="26" width="14" height="10" fill="rgba(28,82,8,0.8)"/>
        <rect x="96" y="48" width="4" height="22" fill="rgba(100,58,18,0.78)"/>
        {/* Ground blocks */}
        <rect x="0" y="66" width="18" height="4" fill="rgba(140,88,38,0.5)"/>
        <rect x="20" y="66" width="18" height="4" fill="rgba(118,78,28,0.5)"/>
        <rect x="40" y="66" width="18" height="4" fill="rgba(140,88,38,0.5)"/>
        {/* Stars */}
        <rect x="42" y="10" width="4" height="4" fill="rgba(255,255,255,0.5)"/>
        <rect x="64" y="5" width="4" height="4" fill="rgba(255,255,255,0.42)"/>
        <rect x="116" y="14" width="4" height="4" fill="rgba(255,255,255,0.45)"/>
        <rect x="136" y="6" width="4" height="4" fill="rgba(255,255,255,0.35)"/>
      </svg>
    </div>
  );
}

function KawaiiDecor() {
  return (
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none flex items-center" style={{ width: 130 }}>
      <svg viewBox="0 0 115 118" width="115" height="118" xmlns="http://www.w3.org/2000/svg">
        {/* Cat face */}
        <circle cx="57" cy="68" r="32" stroke="rgba(138,58,94,0.55)" strokeWidth="1.5" fill="none"/>
        {/* Ears */}
        <polygon points="25,48 33,25 41,48" stroke="rgba(138,58,94,0.55)" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
        <polygon points="73,48 81,25 89,48" stroke="rgba(138,58,94,0.55)" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
        {/* Inner ears */}
        <polygon points="28,47 34,28 39,47" fill="rgba(255,160,190,0.38)"/>
        <polygon points="75,47 81,28 87,47" fill="rgba(255,160,190,0.38)"/>
        {/* Eyes */}
        <ellipse cx="44" cy="64" rx="6.5" ry="7.5" stroke="rgba(138,58,94,0.6)" strokeWidth="1.5" fill="none"/>
        <ellipse cx="70" cy="64" rx="6.5" ry="7.5" stroke="rgba(138,58,94,0.6)" strokeWidth="1.5" fill="none"/>
        <circle cx="46" cy="62" r="1.5" fill="rgba(138,58,94,0.6)"/>
        <circle cx="72" cy="62" r="1.5" fill="rgba(138,58,94,0.6)"/>
        {/* Nose */}
        <polygon points="57,74 54,79 60,79" fill="rgba(138,58,94,0.5)"/>
        {/* Mouth */}
        <path d="M51 81 Q57 87 63 81" stroke="rgba(138,58,94,0.45)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Whiskers */}
        <line x1="18" y1="76" x2="49" y2="77" stroke="rgba(138,58,94,0.32)" strokeWidth="1"/>
        <line x1="65" y1="77" x2="96" y2="76" stroke="rgba(138,58,94,0.32)" strokeWidth="1"/>
        <line x1="20" y1="82" x2="49" y2="80" stroke="rgba(138,58,94,0.22)" strokeWidth="1"/>
        <line x1="65" y1="80" x2="95" y2="82" stroke="rgba(138,58,94,0.22)" strokeWidth="1"/>
        {/* Floating hearts */}
        <text x="8" y="28" fontSize="20" fill="rgba(232,128,159,0.75)" className="wb-twinkle">♡</text>
        <text x="82" y="22" fontSize="14" fill="rgba(232,128,159,0.6)" className="wb-twinkle" style={{ animationDelay: "0.9s" }}>♡</text>
        <text x="96" y="52" fontSize="16" fill="rgba(232,128,159,0.55)" className="wb-twinkle" style={{ animationDelay: "0.4s" }}>♡</text>
      </svg>
    </div>
  );
}

function SunsetDecor() {
  return (
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none overflow-hidden" style={{ width: 155 }}>
      <svg viewBox="0 0 155 100" width="155" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        {/* Mountains */}
        <polygon points="0,100 45,36 90,100" fill="rgba(80,38,118,0.5)"/>
        <polygon points="28,100 78,24 128,100" fill="rgba(96,48,148,0.58)"/>
        <polygon points="78,100 118,48 155,100" fill="rgba(68,32,98,0.44)"/>
        {/* Sun with pulse */}
        <circle cx="78" cy="32" r="23" fill="rgba(255,200,80,0.32)" className="wb-pulse"/>
        <circle cx="78" cy="32" r="23" stroke="rgba(255,220,100,0.68)" strokeWidth="2" fill="none" className="wb-pulse"/>
        {/* Torii gate */}
        <rect x="110" y="56" width="5" height="44" fill="rgba(180,35,10,0.88)"/>
        <rect x="130" y="56" width="5" height="44" fill="rgba(180,35,10,0.88)"/>
        <rect x="106" y="53" width="33" height="5" rx="1" fill="rgba(180,35,10,0.88)"/>
        <rect x="108" y="46" width="27" height="4" rx="1" fill="rgba(180,35,10,0.88)"/>
        <rect x="114" y="50" width="17" height="3" rx="1" fill="rgba(180,35,10,0.7)"/>
      </svg>
    </div>
  );
}

function SceneDecor() {
  return (
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none flex items-center justify-end pr-5" style={{ width: 160 }}>
      <svg viewBox="0 0 84 124" width="74" height="108" xmlns="http://www.w3.org/2000/svg">
        {/* Lightstick body */}
        <rect x="30" y="30" width="24" height="74" rx="12" fill="rgba(155,75,255,0.78)" className="stick-glow" style={{ color: "#B050FF" }}/>
        {/* Inner glow */}
        <rect x="35" y="35" width="14" height="64" rx="7" fill="rgba(210,170,255,0.32)"/>
        {/* Handle */}
        <rect x="34" y="104" width="16" height="18" rx="4" fill="rgba(36,16,56,0.92)"/>
        {/* 8-point star on top */}
        <path d="M42 2 L45 13 L56 9 L48 18 L58 23 L48 25 L51 37 L42 29 L33 37 L36 25 L26 23 L36 18 L28 9 L39 13 Z"
          fill="rgba(255,218,72,0.94)" className="wb-pulse"/>
        {/* Sparkles */}
        <g className="wb-twinkle">
          <line x1="10" y1="44" x2="10" y2="52" stroke="#FF80C0" strokeWidth="2" strokeLinecap="round"/>
          <line x1="6" y1="48" x2="14" y2="48" stroke="#FF80C0" strokeWidth="2" strokeLinecap="round"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "0.6s" }}>
          <line x1="70" y1="62" x2="70" y2="70" stroke="#80FFFF" strokeWidth="2" strokeLinecap="round"/>
          <line x1="66" y1="66" x2="74" y2="66" stroke="#80FFFF" strokeWidth="2" strokeLinecap="round"/>
        </g>
        <g className="wb-twinkle" style={{ animationDelay: "1.1s" }}>
          <line x1="13" y1="88" x2="13" y2="94" stroke="#C0A0FF" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="10" y1="91" x2="16" y2="91" stroke="#C0A0FF" strokeWidth="1.5" strokeLinecap="round"/>
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
        {/* Corner brackets */}
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
          <p
            className="text-xs tracking-[0.22em] mb-3"
            style={{
              color: pal.subtitle,
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
            }}
          >
            ДОБРО ПОЖАЛОВАТЬ
          </p>

          <h1
            className="leading-none mb-5"
            style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontWeight: 600,
              fontStyle: "italic",
              fontSize: "clamp(2.4rem, 7vw, 3.5rem)",
              color: pal.name,
              letterSpacing: "-0.01em",
            }}
          >
            {name}
          </h1>

          <div
            className="mb-5"
            style={{ height: "1px", background: `linear-gradient(90deg, ${pal.gold}, rgba(0,0,0,0) 80%)`, opacity: 0.5 }}
          />

          <div className="flex items-stretch gap-0">
            {[
              { label: "ЗАДАНИЯ", value: pendingCount },
              { label: "УРОКИ",   value: lessonsCount },
              ...(checkedCount > 0 ? [{ label: "ПРОВЕРЕНО", value: checkedCount }] : []),
            ].map((stat, i, arr) => (
              <div key={stat.label} className="flex items-stretch">
                <div className="pr-5 sm:pr-7">
                  <p
                    className="text-xs tracking-[0.18em] mb-1"
                    style={{
                      color: pal.subtitle,
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontWeight: 500,
                    }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="leading-none"
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontWeight: 600,
                      fontSize: "clamp(1.8rem, 5vw, 2.4rem)",
                      color: pal.name,
                    }}
                  >
                    {stat.value}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className="self-stretch mr-5 sm:mr-7"
                    style={{ width: "1px", background: pal.goldBorder }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Decorated themed banner ───────────────────────────────────────────────────
  const serif = "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif";
  const isCraft = theme === "craft";
  const nameFont  = isCraft ? "'Press Start 2P', monospace" : serif;
  const nameFontSize  = isCraft ? "clamp(0.8rem, 2.2vw, 1rem)" : "clamp(1.65rem, 5vw, 1.9rem)";
  const nameFontStyle = isCraft ? "normal" : "italic";

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-5 sm:p-6 mb-6"
      style={{ background: "var(--theme-banner-bg)", boxShadow: "var(--theme-banner-shadow)" }}
    >
      <ThemeDecor theme={theme} />

      <div className="relative z-10" style={{ paddingRight: "clamp(76px, 28%, 175px)" }}>
        <p
          className="mb-1.5 uppercase"
          style={{
            fontSize: 12,
            letterSpacing: "1.5px",
            fontFamily: serif,
            fontWeight: 500,
            color: "var(--theme-banner-subtitle, rgba(255,255,255,0.7))",
          }}
        >
          Привет,
        </p>
        <h1
          className="leading-tight mb-4"
          style={{
            fontSize: nameFontSize,
            fontFamily: nameFont,
            fontStyle: nameFontStyle,
            fontWeight: isCraft ? 400 : 600,
            color: "var(--theme-banner-name, #fff)",
            textShadow: "0 1px 8px rgba(0,0,0,0.15)",
          }}
        >
          {name}!
        </h1>

        <div className="flex flex-wrap gap-2">
          {[
            { icon: <ClipboardList size={14}/>, text: `${pendingCount} ${wordForm(pendingCount, ["задание","задания","заданий"])}` },
            { icon: <CalendarDays size={14}/>,  text: `${lessonsCount} ${wordForm(lessonsCount, ["урок","урока","уроков"])}` },
            ...(checkedCount > 0 ? [{ icon: <Star size={14}/>, text: `${checkedCount} проверено` }] : []),
          ].map(s => (
            <div
              key={s.text}
              className="flex items-center gap-2 px-3 py-1.5"
              style={{
                background: "var(--theme-banner-stat-bg, rgba(255,255,255,0.18))",
                backdropFilter: "blur(4px)",
                borderRadius: "var(--theme-radius, 12px)",
              }}
            >
              <span style={{ color: "var(--theme-banner-name, #fff)", opacity: 0.8 }}>{s.icon}</span>
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--theme-banner-name, #fff)", fontFamily: "sans-serif" }}
              >
                {s.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
