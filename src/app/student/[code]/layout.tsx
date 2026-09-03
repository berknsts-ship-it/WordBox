import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ThemeProvider from "@/components/student/ThemeProvider";
import ThemePickerPopover from "@/components/student/ThemePickerPopover";
import StudentHeaderLogo from "@/components/student/StudentHeaderLogo";
import ActivityTracker from "@/components/student/ActivityTracker";
import type { ThemeId } from "@/components/student/themes";
import "../themes.css";

export default async function StudentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("id, theme")
    .eq("access_code", code)
    .single();

  const studentId    = data?.id    ?? "";
  const initialTheme = (data?.theme as ThemeId | null) ?? "classic";

  // "Последний вход" для сводки у репетитора — трогаем на каждой загрузке
  // кабинета, отдельно от точечных событий в activity_log (те льются
  // только на значимые действия, не на каждый заход).
  if (studentId) {
    await createAdminClient().from("students").update({ last_seen_at: new Date().toISOString() }).eq("id", studentId);
  }

  return (
    <ThemeProvider initialTheme={initialTheme} studentId={studentId}>
      <ActivityTracker code={code} />
      <div className="flex min-h-full flex-col">
        {/* Фон — diary или тема */}
        <div className="diary-bg-fixed" />

        <header
          className="sticky top-0 z-20 backdrop-blur-md border-b"
          style={{
            background:   "color-mix(in srgb, var(--theme-card-bg, white) 80%, transparent)",
            borderColor:  "var(--theme-card-border, rgba(156,122,69,0.2))",
            boxShadow:    "0 1px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center gap-2.5 h-14">
            <div className="flex-1">
              <StudentHeaderLogo />
            </div>
            <ThemePickerPopover />
          </div>
        </header>

        <main
          className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-5 sm:py-6 relative"
          style={{ zIndex: 1 }}
        >
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
