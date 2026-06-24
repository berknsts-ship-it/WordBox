"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { label: "Главная",          href: "/tutor/dashboard",  icon: "🏠" },
  { label: "Ученики",          href: "/tutor/students",   icon: "👩‍🎓" },
  { label: "Расписание",       href: "/tutor/schedule",   icon: "📅" },
  { label: "Домашние задания", href: "/tutor/homework",   icon: "📝" },
  { label: "Словари",          href: "/tutor/vocabulary", icon: "📚" },
];

export default function TutorNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-20"
        style={{ borderColor: "var(--brown-pale)" }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Лого */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <span className="font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--brown-dark)" }}>
                Word Box
              </span>
            </div>
            {/* Десктоп навигация */}
            <nav className="hidden sm:flex items-center gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
                  style={
                    pathname.startsWith(item.href)
                      ? { background: "var(--brown-pale)", color: "var(--brown-dark)" }
                      : { color: "var(--brown-light)" }
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm" style={{ color: "var(--brown-light)" }}>
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="hidden sm:block text-sm font-semibold transition-colors hover:text-red-500"
              style={{ color: "var(--brown-light)" }}
            >
              Выйти
            </button>

            {/* Бургер-кнопка */}
            <button
              onClick={() => setOpen(!open)}
              className="sm:hidden flex flex-col gap-1.5 p-2 rounded-xl transition-colors"
              style={{ color: "var(--brown-mid)" }}
              aria-label="Меню"
            >
              <span className={`block w-5 h-0.5 transition-all duration-200 ${open ? "rotate-45 translate-y-2" : ""}`}
                style={{ background: "var(--brown-mid)" }} />
              <span className={`block w-5 h-0.5 transition-all duration-200 ${open ? "opacity-0" : ""}`}
                style={{ background: "var(--brown-mid)" }} />
              <span className={`block w-5 h-0.5 transition-all duration-200 ${open ? "-rotate-45 -translate-y-2" : ""}`}
                style={{ background: "var(--brown-mid)" }} />
            </button>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-10 pt-14"
          style={{ background: "rgba(253,248,240,0.98)", backdropFilter: "blur(8px)" }}>
          <nav className="flex flex-col p-4 gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-colors"
                style={
                  pathname.startsWith(item.href)
                    ? { background: "var(--brown-pale)", color: "var(--brown-dark)" }
                    : { color: "var(--brown-mid)" }
                }
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--brown-pale)" }}>
              <p className="text-xs px-4 mb-3" style={{ color: "var(--brown-light)" }}>{userEmail}</p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl w-full text-base font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <span className="text-xl">🚪</span>
                Выйти
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
