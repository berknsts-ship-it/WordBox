"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-[family-name:var(--font-lora)] text-2xl font-semibold">
        Нет соединения с интернетом
      </h1>
      <p className="max-w-sm text-sm opacity-70">
        Страница пока недоступна офлайн. Как только соединение восстановится, попробуйте снова.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-black/5"
      >
        Обновить страницу
      </button>
    </div>
  );
}
