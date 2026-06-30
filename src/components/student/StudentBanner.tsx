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
          {/* Label */}
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

          {/* Name */}
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

          {/* Gold divider */}
          <div
            className="mb-5"
            style={{ height: "1px", background: `linear-gradient(90deg, ${pal.gold}, rgba(0,0,0,0) 80%)`, opacity: 0.5 }}
          />

          {/* Stats columns */}
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

  // ── Default banner ────────────────────────────────────────────────────────
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-5 sm:p-6 mb-6"
      style={{ background: "var(--theme-banner-bg)", boxShadow: "var(--theme-banner-shadow)" }}
    >
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
      <div className="absolute -right-2 top-12 w-24 h-24 rounded-full"  style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="absolute right-16 -bottom-6 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />

      <div className="relative z-10">
        <p className="text-sm font-medium mb-1" style={{ color: "var(--theme-banner-subtitle)" }}>
          Привет,
        </p>
        <h1
          className="text-2xl sm:text-3xl font-bold mb-4"
          style={{ fontFamily: "var(--font-lora)", color: "var(--theme-banner-name)", textShadow: "0 1px 8px rgba(0,0,0,0.15)" }}
        >
          {name}!
        </h1>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "var(--theme-banner-stat-bg)", backdropFilter: "blur(4px)" }}>
            <ClipboardList size={14} style={{ color: "var(--theme-banner-name)", opacity: 0.8 }} />
            <span className="text-sm font-semibold" style={{ color: "var(--theme-banner-name)" }}>
              {pendingCount} {wordForm(pendingCount, ["задание", "задания", "заданий"])}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "var(--theme-banner-stat-bg)", backdropFilter: "blur(4px)" }}>
            <CalendarDays size={14} style={{ color: "var(--theme-banner-name)", opacity: 0.8 }} />
            <span className="text-sm font-semibold" style={{ color: "var(--theme-banner-name)" }}>
              {lessonsCount} {wordForm(lessonsCount, ["урок", "урока", "уроков"])}
            </span>
          </div>
          {checkedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "var(--theme-banner-stat-bg)", backdropFilter: "blur(4px)" }}>
              <Star size={14} style={{ color: "var(--theme-banner-name)", opacity: 0.8 }} />
              <span className="text-sm font-semibold" style={{ color: "var(--theme-banner-name)" }}>
                {checkedCount} проверено
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
