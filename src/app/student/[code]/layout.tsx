export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col diary-bg">
      <header className="bg-white/80 backdrop-blur border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-2 h-14">
          <span className="text-lg">📚</span>
          <span className="font-bold text-stone-900">Word Box</span>
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-4 py-5 sm:py-6 relative">
        {children}
      </main>
    </div>
  );
}
