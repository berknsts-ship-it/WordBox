"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock } from "lucide-react";
import WBLogo from "@/components/WBLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Неверный email или пароль");
      setLoading(false);
      return;
    }
    router.push("/tutor/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">

        {/* ── Логотип — главная витрина бренда ── */}
        <div className="text-center mb-10">
          <div className="inline-flex flex-col items-center gap-4">
            <WBLogo size={88} ringColor="#9C7A45" textColor="#4A1414" />

            <div>
              {/* Надпись WORD BOX */}
              <h1
                style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                  fontWeight: 600,
                  fontSize: "2rem",
                  letterSpacing: "0.18em",
                  color: "#4A1414",
                  lineHeight: 1.1,
                }}
              >
                WORD BOX
              </h1>

              {/* Тонкая золотая линия */}
              <div
                className="mx-auto my-2.5"
                style={{
                  height: "1px",
                  width: "80px",
                  background: "linear-gradient(90deg, transparent, #9C7A45, transparent)",
                }}
              />

              {/* Подзаголовок */}
              <p
                style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  letterSpacing: "0.22em",
                  color: "rgba(156,122,69,0.85)",
                  textTransform: "uppercase",
                }}
              >
                Кабинет репетитора
              </p>
            </div>
          </div>
        </div>

        {/* ── Карточка формы ── */}
        <div
          className="relative rounded-2xl p-8"
          style={{
            background: "rgba(253,248,242,0.92)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 40px rgba(28,10,11,0.10), inset 0 0 0 1px rgba(156,122,69,0.30)",
          }}
        >
          {/* Угловые скобки */}
          {(["tl","tr","bl","br"] as const).map(pos => (
            <div
              key={pos}
              className="absolute w-4 h-4"
              style={{
                top:    pos.startsWith("t") ? 10 : "auto",
                bottom: pos.startsWith("b") ? 10 : "auto",
                left:   pos.endsWith("l") ? 10 : "auto",
                right:  pos.endsWith("r") ? 10 : "auto",
                borderTop:    pos.startsWith("t") ? "1px solid #9C7A45" : "none",
                borderBottom: pos.startsWith("b") ? "1px solid #9C7A45" : "none",
                borderLeft:   pos.endsWith("l") ? "1px solid #9C7A45" : "none",
                borderRight:  pos.endsWith("r") ? "1px solid #9C7A45" : "none",
                opacity: 0.6,
              }}
            />
          ))}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-widest"
                style={{ color: "#9C7A45" }}
              >
                Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "rgba(156,122,69,0.5)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none transition"
                  style={{
                    background: "rgba(240,231,218,0.60)",
                    border: "1px solid rgba(156,122,69,0.30)",
                    color: "#1c0a0b",
                  }}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-widest"
                style={{ color: "#9C7A45" }}
              >
                Пароль
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "rgba(156,122,69,0.5)" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none transition"
                  style={{
                    background: "rgba(240,231,218,0.60)",
                    border: "1px solid rgba(156,122,69,0.30)",
                    color: "#1c0a0b",
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm rounded-xl px-4 py-3 bg-red-50 text-red-600 border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl px-4 py-3.5 font-semibold transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98] uppercase tracking-widest text-sm mt-1"
              style={{
                background: "linear-gradient(135deg, #74070E 0%, #9a0f17 100%)",
                color: "#fdf3e3",
                boxShadow: "0 4px 18px rgba(116,7,14,0.40)",
                letterSpacing: "0.15em",
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              {loading ? "Входим..." : "Войти"}
            </button>
          </form>
        </div>

        {/* ── Ссылка на ученика ── */}
        <p
          className="text-center text-xs mt-6 uppercase tracking-widest"
          style={{ color: "rgba(156,122,69,0.70)" }}
        >
          Ты ученик?{" "}
          <a
            href="/student"
            className="font-semibold hover:underline"
            style={{ color: "#9C7A45" }}
          >
            Войди по коду
          </a>
        </p>
      </div>
    </div>
  );
}
