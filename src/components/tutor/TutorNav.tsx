"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Users, CalendarDays, ClipboardList,
  BookOpen, LogOut, X, Menu, PenLine,
} from "lucide-react";

const NAV = [
  { label: "Главная",          href: "/tutor/dashboard",  icon: LayoutDashboard },
  { label: "Ученики",          href: "/tutor/students",   icon: Users },
  { label: "Доска",            href: "/tutor/board",      icon: PenLine },
  { label: "Расписание",       href: "/tutor/schedule",   icon: CalendarDays },
  { label: "Домашние задания", href: "/tutor/homework",   icon: ClipboardList },
  { label: "Словари",          href: "/tutor/vocabulary", icon: BookOpen },
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
      <header
        className="bg-white/90 backdrop-blur-md sticky top-0 z-20"
        style={{ boxShadow: "var(--shadow-nav)", borderBottom: "1px solid var(--brown-pale)" }}
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Лого */}
          <div className="flex items-center gap-6">
            <Link href="/tutor/dashboard" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--gradient-primary)" }}
              >
                <BookOpen size={15} className="text-white" />
              </div>
              <span
                className="font-bold text-base"
                style={{
                  fontFamily: "var(--font-lora)",
                  background: "var(--gradient-primary)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Word Box
              </span>
            </Link>

            {/* Десктоп навигация */}
            <nav className="hidden sm:flex items-center gap-0.5">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
                    style={
                      active
                        ? {
                            background: "var(--gradient-primary)",
                            color: "#fff",
                            boxShadow: "var(--shadow-button)",
                          }
                        : { color: "var(--brown-light)" }
                    }
                  >
                    <Icon size={14} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs" style={{ color: "var(--brown-light)" }}>
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-red-500"
              style={{ color: "var(--brown-light)" }}
            >
              <LogOut size={15} />
              Выйти
            </button>

            <button
              onClick={() => setOpen(!open)}
              className="sm:hidden p-2 rounded-xl transition-colors"
              style={{ color: "var(--brown-mid)" }}
              aria-label="Меню"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 z-10 pt-14"
          style={{ background: "rgba(253,248,240,0.97)", backdropFilter: "blur(12px)" }}
        >
          <nav className="flex flex-col p-4 gap-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all"
                  style={
                    active
                      ? {
                          background: "var(--gradient-primary)",
                          color: "#fff",
                          boxShadow: "var(--shadow-button)",
                        }
                      : { color: "var(--brown-mid)" }
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--brown-pale)" }}>
              <p className="text-xs px-4 mb-3" style={{ color: "var(--brown-light)" }}>
                {userEmail}
              </p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl w-full text-base font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                Выйти
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
