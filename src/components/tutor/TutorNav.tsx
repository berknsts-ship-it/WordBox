"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Users, CalendarDays, ClipboardList,
  BookOpen, LogOut, X, Menu, PenLine, Bell, FolderOpen, GraduationCap, Settings,
  ChevronDown,
} from "lucide-react";
import WBLogo from "@/components/WBLogo";

const PRIMARY_NAV = [
  { label: "Главная",          href: "/tutor/dashboard",  icon: LayoutDashboard },
  { label: "Ученики",          href: "/tutor/students",   icon: Users },
  { label: "Доска",            href: "/tutor/board",      icon: PenLine },
  { label: "Расписание",       href: "/tutor/schedule",   icon: CalendarDays },
  { label: "Контрольные",      href: "/tutor/tests",         icon: GraduationCap },
  { label: "Домашние задания", href: "/tutor/homework",      icon: ClipboardList },
];

const SECONDARY_NAV = [
  { label: "Уведомления",      href: "/tutor/notifications", icon: Bell },
  { label: "Материалы",        href: "/tutor/materials",     icon: FolderOpen },
  { label: "Словари",          href: "/tutor/vocabulary",    icon: BookOpen },
  { label: "Настройки",        href: "/tutor/settings",      icon: Settings },
];

const NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];

// Below this, the primary-items-plus-"Ещё" bar no longer fits — fall back
// to the hamburger instead of a cramped/overflowing bar.
const MEDIUM_MIN = 1220;
// Below this, even all 10 items inline don't fit — use the "Ещё" bar.
const FULL_MIN = 1480;

type Tier = "mobile" | "medium" | "full";

function useNavTier(): Tier {
  // Default to "mobile" (safe on any width — the hamburger never overflows)
  // until we can measure the real viewport; useLayoutEffect corrects this
  // synchronously before the browser paints, so wide screens don't flash
  // an overflowing bar first.
  const [tier, setTier] = useState<Tier>("mobile");

  useLayoutEffect(() => {
    const mqMedium = window.matchMedia(`(min-width: ${MEDIUM_MIN}px)`);
    const mqFull = window.matchMedia(`(min-width: ${FULL_MIN}px)`);

    function update() {
      setTier(mqFull.matches ? "full" : mqMedium.matches ? "medium" : "mobile");
    }

    update();
    mqMedium.addEventListener("change", update);
    mqFull.addEventListener("change", update);
    return () => {
      mqMedium.removeEventListener("change", update);
      mqFull.removeEventListener("change", update);
    };
  }, []);

  return tier;
}

function NavLink({ item, pathname, dense }: { item: (typeof NAV)[number]; pathname: string; dense?: boolean }) {
  const Icon = item.icon;
  const active = pathname.startsWith(item.href);
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-1 rounded-xl font-semibold transition-all whitespace-nowrap ${dense ? "px-1.5 py-1.5 text-[13px]" : "px-3 py-1.5 text-sm gap-1.5"}`}
      style={
        active
          ? { background: "var(--gradient-primary)", color: "#fff", boxShadow: "var(--shadow-button)" }
          : { color: "var(--brown-light)" }
      }
    >
      <Icon size={14} />
      {item.label}
    </Link>
  );
}

function MoreMenu({ items, pathname }: { items: typeof SECONDARY_NAV; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const anyActive = items.some(item => pathname.startsWith(item.href));

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
        style={anyActive ? { background: "var(--gradient-primary)", color: "#fff", boxShadow: "var(--shadow-button)" } : { color: "var(--brown-light)" }}
      >
        Ещё
        <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-2 py-1.5 rounded-2xl min-w-[180px] z-30"
          style={{ background: "#fff", boxShadow: "var(--shadow-nav), 0 8px 24px rgba(28,10,11,0.15)", border: "1px solid var(--brown-pale)" }}
        >
          {items.map(item => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors"
                style={active ? { color: "#74070E", fontWeight: 700 } : { color: "var(--brown-dark)" }}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TutorNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const tier = useNavTier();
  const isDesktop = tier !== "mobile";

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
        <div
          className="mx-auto px-4 flex items-center justify-between h-14 gap-3"
          style={{ maxWidth: tier === "full" ? 1680 : 1152 }}
        >
          {/* Лого */}
          <div className="flex items-center gap-4 min-w-0 shrink-0" style={{ gap: tier === "full" ? 24 : 16 }}>
            <Link href="/tutor/dashboard" className="flex items-center gap-2.5 group shrink-0">
              <WBLogo size={40} ringColor="#9C7A45" textColor="#4A1414" />
              <span
                className="leading-none hidden sm:block"
                style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                  fontWeight: 600,
                  fontSize: "1.15rem",
                  color: "#4A1414",
                  letterSpacing: "0.06em",
                }}
              >
                Word Box
              </span>
            </Link>

            {tier === "full" && (
              <nav className="flex items-center gap-0.5">
                {NAV.map(item => <NavLink key={item.href} item={item} pathname={pathname} />)}
              </nav>
            )}

            {tier === "medium" && (
              <nav className="flex items-center gap-0.5">
                {PRIMARY_NAV.map(item => <NavLink key={item.href} item={item} pathname={pathname} dense />)}
                <MoreMenu items={SECONDARY_NAV} pathname={pathname} />
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isDesktop && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-red-500 whitespace-nowrap"
                style={{ color: "var(--brown-light)" }}
              >
                <LogOut size={15} />
                Выйти
              </button>
            )}

            {!isDesktop && (
              <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-xl transition-colors"
                style={{ color: "var(--brown-mid)" }}
                aria-label="Меню"
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {!isDesktop && open && (
        <div
          className="fixed inset-0 z-40 flex flex-col"
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
