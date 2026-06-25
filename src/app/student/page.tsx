"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentEntryPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function handleSubmit() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    router.push(`/student/${trimmed}`);
  }

  if (!showForm) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">

          {/* Иконка */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6"
            style={{ background: "var(--brown-pale)" }}>
            <span className="text-5xl">📚</span>
          </div>

          {/* Заголовок */}
          <h1 className="text-4xl mb-3" style={{ color: "var(--brown-dark)", fontFamily: "var(--font-lora)" }}>
            Word Box
          </h1>
          <p className="text-base mb-2" style={{ color: "var(--brown-mid)" }}>
            Твой личный кабинет
          </p>
          <p className="text-sm mb-10" style={{ color: "var(--brown-light)" }}>
            Уроки, задания, словари и доска — всё в одном месте
          </p>

          {/* Фичи */}
          <div className="grid grid-cols-2 gap-3 mb-10 text-left">
            {[
              { icon: "📅", title: "Расписание", desc: "Все твои уроки" },
              { icon: "📝", title: "Задания", desc: "Домашняя работа" },
              { icon: "🖊️", title: "Доска", desc: "Наша общая доска" },
              { icon: "🃏", title: "Тренажёр", desc: "Учи слова" },
            ].map((f) => (
              <div key={f.title} className="bg-white/70 rounded-2xl p-4 border"
                style={{ borderColor: "var(--brown-pale)" }}>
                <span className="text-2xl">{f.icon}</span>
                <p className="font-semibold text-sm mt-2" style={{ color: "var(--brown-dark)" }}>{f.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--brown-light)" }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Кнопка входа */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-2xl px-4 py-4 text-white font-semibold text-base transition-opacity hover:opacity-90"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
          >
            Войти по коду →
          </button>

          <p className="text-center text-sm mt-5" style={{ color: "var(--brown-light)" }}>
            Ты репетитор?{" "}
            <a href="/login" className="font-semibold hover:underline"
              style={{ color: "var(--brown-mid)" }}>
              Войти в аккаунт
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <button
          onClick={() => setShowForm(false)}
          className="flex items-center gap-1 text-sm mb-8 hover:opacity-70 transition-opacity"
          style={{ color: "var(--brown-light)" }}
        >
          ← Назад
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "var(--brown-pale)" }}>
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-2xl" style={{ color: "var(--brown-dark)" }}>Введи свой код</h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--brown-light)" }}>
            Код выдаёт репетитор
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-3xl border p-6"
          style={{ borderColor: "var(--brown-pale)" }}>
          <div className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
              maxLength={20}
              className="w-full rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-widest focus:outline-none transition"
              style={{
                background: "#fdf8f0",
                border: "1.5px solid var(--brown-pale)",
                color: "var(--brown-dark)",
                letterSpacing: "0.25em",
              }}
              placeholder="ABC123"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !code.trim()}
              className="w-full rounded-xl px-4 py-3.5 text-white font-semibold text-base transition-opacity disabled:opacity-50"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
            >
              {loading ? "Загрузка..." : "Открыть кабинет →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
