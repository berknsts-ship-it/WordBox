"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { label: "Главная",          href: "/tutor/dashboard" },
  { label: "Ученики",          href: "/tutor/students" },
  { label: "Расписание",       href: "/tutor/schedule" },
  { label: "Домашние задания", href: "/tutor/homework" },
  { label: "Словари",          href: "/tutor/vocabulary" },
];

export default function TutorNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-10"
      style={{ borderColor: "var(--brown-pale)" }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">📚</span>
            <span className="font-bold" style={{ fontFamily: "var(--font-lora)", color: "var(--brown-dark)" }}>
              Word Box
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
                style={
                  pathname === item.href
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
            className="text-sm font-semibold transition-colors hover:text-red-500"
            style={{ color: "var(--brown-light)" }}
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}
