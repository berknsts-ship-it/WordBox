"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Users, CalendarDays, ClipboardList,
  BookOpen, LogOut, X, Menu, PenLine, Bell, FolderOpen,
} from "lucide-react";
import WBLogo from "@/components/WBLogo";

const NAV = [
  { label: "Главная",          href: "/tutor/dashboard",  icon: LayoutDashboard },
  { label: "Ученики",          href: "/tutor/students",   icon: Users },
  { label: "Доска",            href: "/tutor/board",      icon: PenLine },
  { label: "Расписание",       href: "/tutor/schedule",   icon: CalendarDays },
  { label: "Домашние задания", href: "/tutor/homework",      icon: ClipboardList },
  { label: "Материалы",        href: "/tutor/materials",     icon: FolderOpen },
  { label: "Словари",          href: "/tutor/vocabulary",    icon: BookOpen },
  { label: "Уведомления",      href: "/tutor/notifications", icon: Bell },
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
              <WBLogo size={44} ringColor="#9C7A45" textColor="#4A1414" />
              <span
                className="leading-none"
                style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                  fontWeight: 600,
                  fontSize: "1.25rem",
                  color: "#4A1414",
                  letterSpacing: "0.06em",
                }}
              >
                Word Box
              </span>
            </Link>

            {/* Десктоп навигация */}
            <nav className="hidden lg:flex items-center gap-0.5">
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
            <span className="hidden lg:block text-xs" style={{ color: "var(--brown-light)" }}>
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-red-500"
              style={{ color: "var(--brown-light)" }}
            >
              <LogOut size={15} />
              Выйти
            </button>

            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-xl transition-colors"
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
          className="lg:hidden fixed inset-0 z-40 flex flex-col"
          style={{ background: "#fdf8f2", top: 56 }}
        >
          {/* Luxury divider at top */}
          <div className="h-px mx-5 mt-1" style={{ background: "linear-gradient(90deg, transparent, rgba(156,122,69,0.35), transparent)" }} />

          <nav className="flex flex-col px-4 pt-3 pb-4 gap-0.5 flex-1 overflow-y-auto">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base transition-all"
                  style={
                    active
                      ? {
                          background: "linear-gradient(135deg, #5e1018, #74070E)",
                          color: "#EDE0CC",
                          boxShadow: "0 4px 16px rgba(116,7,14,0.28)",
                          fontFamily: "var(--font-cormorant), Georgia, serif",
                          fontWeight: 600,
                          letterSpacing: "0.03em",
                        }
                      : {
                          color: "var(--brown-dark)",
                          fontFamily: "var(--font-cormorant), Georgia, serif",
                          fontWeight: 500,
                          letterSpacing: "0.02em",
                          fontSize: "1.05rem",
                        }
                  }
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: active ? "rgba(237,224,204,0.18)" : "rgba(156,122,69,0.10)",
                    }}>
                    <Icon size={16} style={{ color: active ? "#C4A468" : "var(--brown-mid)" }} />
                  </div>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-5 py-4 shrink-0"
            style={{ borderTop: "1px solid rgba(156,122,69,0.18)" }}>
            <p className="text-xs mb-3 px-1 tracking-wider uppercase"
              style={{ color: "var(--brown-light)", fontFamily: "var(--font-cormorant), Georgia, serif" }}>
              {userEmail}
            </p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-sm font-medium transition-colors hover:bg-red-50"
              style={{ color: "#b03030", fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 500, fontSize: "1rem" }}
            >
              <LogOut size={16} />
              Выйти из аккаунта
            </button>
          </div>
        </div>
      )}
    </>
  );
}
