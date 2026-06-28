import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ThemeProvider from "@/components/student/ThemeProvider";
import ThemePickerPopover from "@/components/student/ThemePickerPopover";
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

  return (
    <ThemeProvider initialTheme={initialTheme} studentId={studentId}>
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
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--theme-accent, #74070E)" }}
            >
              <BookOpen size={13} className="text-white" />
            </div>
            <span
              className="font-bold text-base flex-1"
              style={{ color: "var(--theme-accent, #74070E)", fontFamily: "var(--theme-font)" }}
            >
              Word Box
            </span>

            {/* Palette icon → theme picker */}
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
