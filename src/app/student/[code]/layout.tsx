import { BookOpen } from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      {/* Фон ежедневника — покрывает весь экран снизу */}
      <div className="diary-bg-fixed" />

      <header
        className="sticky top-0 z-20 bg-white/75 backdrop-blur-md border-b"
        style={{ borderColor: "var(--brown-pale)", boxShadow: "0 1px 12px rgba(59,42,26,0.07)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center gap-2.5 h-14">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <BookOpen size={13} className="text-white" />
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
        </div>
      </header>

      <main
        className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-5 sm:py-6 relative"
        style={{ zIndex: 1 }}
      >
        {children}
      </main>
    </div>
  );
}
