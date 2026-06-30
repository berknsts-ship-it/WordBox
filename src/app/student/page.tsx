"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WBLogo from "@/components/WBLogo";
import { CalendarDays, ClipboardList, PenLine, BookOpen } from "lucide-react";

const FEATURES = [
  { icon: CalendarDays,  title: "Расписание",   desc: "Все твои уроки"     },
  { icon: ClipboardList, title: "Задания",       desc: "Домашняя работа"    },
  { icon: PenLine,       title: "Доска",         desc: "Наша общая доска"   },
  { icon: BookOpen,      title: "Тренажёр",      desc: "Учи слова"          },
];

export default function StudentEntryPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    router.push(`/student/${trimmed}`);
  }

  if (showForm) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: "var(--background)" }}>
        <div className="w-full max-w-sm">
          <button
            onClick={() => setShowForm(false)}
            className="flex items-center gap-1 text-sm mb-8 hover:opacity-70 transition-opacity"
            style={{ color: "var(--brown-light)" }}
          >
            ← Назад
          </button>

          <div className="text-center mb-8">
            <WBLogo size={56} ringColor="#9C7A45" textColor="#4A1414" />
            <h1 className="mt-5 text-2xl font-semibold"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--brown-dark)", letterSpacing: "0.04em" }}>
              Введи свой код
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: "var(--brown-light)" }}>
              Код выдаёт репетитор
            </p>
          </div>

          <div className="rounded-2xl p-6"
            style={{
              background: "rgba(253,248,242,0.92)",
              boxShadow: "0 4px 24px rgba(28,10,11,0.08), inset 0 0 0 1px rgba(156,122,69,0.22)",
            }}>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              autoFocus
              maxLength={20}
              autoCapitalize="characters"
              autoCorrect="off"
              autoComplete="off"
              className="w-full rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-widest focus:outline-none transition"
              style={{
                background: "white",
                border: "1px solid rgba(156,122,69,0.28)",
                color: "var(--brown-dark)",
                letterSpacing: "0.22em",
                fontFamily: "var(--font-cormorant), Georgia, serif",
              }}
              placeholder="ABC123"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !code.trim()}
              className="w-full mt-4 rounded-xl px-4 py-3.5 font-semibold text-base transition-opacity disabled:opacity-50 tracking-widest uppercase"
              style={{
                background: "linear-gradient(135deg, #5e1018, #74070E)",
                color: "#EDE0CC",
                boxShadow: "0 4px 16px rgba(116,7,14,0.32)",
                fontFamily: "var(--font-cormorant), Georgia, serif",
                letterSpacing: "0.18em",
              }}
            >
              {loading ? "Открываю..." : "Войти →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>

      {/* Hero banner */}
      <div
        className="relative overflow-hidden flex flex-col items-center justify-center px-6 pt-12 pb-10"
        style={{
          background: "linear-gradient(145deg, #3d0a0e 0%, #5a0e14 45%, #3a0a0d 100%)",
          boxShadow: "0 8px 40px rgba(28,10,11,0.22)",
        }}
      >
        {/* Corner brackets */}
        {(["tl","tr","bl","br"] as const).map(pos => (
          <div key={pos} className="absolute w-6 h-6" style={{
            top:    pos.startsWith("t") ? 12 : "auto",
            bottom: pos.startsWith("b") ? 12 : "auto",
            left:   pos.endsWith("l")   ? 12 : "auto",
            right:  pos.endsWith("r")   ? 12 : "auto",
            borderTop:    pos.startsWith("t") ? "1.5px solid rgba(196,164,104,0.55)" : "none",
            borderBottom: pos.startsWith("b") ? "1.5px solid rgba(196,164,104,0.55)" : "none",
            borderLeft:   pos.endsWith("l")   ? "1.5px solid rgba(196,164,104,0.55)" : "none",
            borderRight:  pos.endsWith("r")   ? "1.5px solid rgba(196,164,104,0.55)" : "none",
          }} />
        ))}

        {/* Top gold strip */}
        <div className="absolute top-0 left-12 right-12 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(196,164,104,0.45), transparent)" }} />

        <WBLogo size={72} ringColor="#C4A468" textColor="#EDE0CC" />

        <div className="mt-5 text-center">
          <p className="text-xs tracking-[0.28em] mb-2"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "rgba(196,164,104,0.70)", fontWeight: 500 }}>
            ЛИЧНЫЙ КАБИНЕТ
          </p>
          <h1
            className="leading-tight"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontWeight: 600,
              fontStyle: "italic",
              fontSize: "2.6rem",
              color: "#EDE0CC",
              letterSpacing: "-0.01em",
            }}
          >
            Word Box
          </h1>
          <div className="flex items-center gap-3 mt-3 justify-center">
            <div className="flex-1 h-px" style={{ background: "rgba(196,164,104,0.30)", maxWidth: 60 }} />
            <div className="w-1 h-1 rounded-full" style={{ background: "rgba(196,164,104,0.55)" }} />
            <div className="flex-1 h-px" style={{ background: "rgba(196,164,104,0.30)", maxWidth: 60 }} />
          </div>
          <p className="mt-3 text-sm"
            style={{ color: "rgba(237,224,204,0.65)", fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 500, letterSpacing: "0.04em" }}>
            Уроки, задания, словари и доска
          </p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="flex-1 px-5 py-8">
        <p className="luxury-section-label text-center mb-5">Твои инструменты</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title}
              className="rounded-2xl p-4"
              style={{
                background: "rgba(253,248,242,0.88)",
                boxShadow: "0 2px 12px rgba(28,10,11,0.06), inset 0 0 0 1px rgba(156,122,69,0.18)",
              }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "linear-gradient(145deg, #5e1018, #74070E)", boxShadow: "0 3px 10px rgba(116,7,14,0.28)" }}>
                <Icon size={16} style={{ color: "#C4A468" }} />
              </div>
              <p className="font-semibold text-sm leading-tight mb-0.5"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1rem", fontWeight: 600, color: "var(--brown-dark)" }}>
                {title}
              </p>
              <p className="text-xs" style={{ color: "var(--brown-light)" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-2xl px-4 py-4 font-semibold text-base transition-all active:scale-[0.98] tracking-widest uppercase"
          style={{
            background: "linear-gradient(135deg, #5e1018, #74070E)",
            color: "#EDE0CC",
            boxShadow: "0 6px 20px rgba(116,7,14,0.36)",
            fontFamily: "var(--font-cormorant), Georgia, serif",
            letterSpacing: "0.18em",
          }}
        >
          Войти по коду →
        </button>

        <p className="text-center text-sm mt-5" style={{ color: "var(--brown-light)" }}>
          Ты репетитор?{" "}
          <a href="/login" className="font-semibold hover:underline"
            style={{ color: "var(--brown-mid)" }}>
            Войти в аккаунт
          </a>
        </p>
      </div>
    </div>
  );
}
