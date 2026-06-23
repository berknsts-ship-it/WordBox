"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentEntryPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    router.push(`/student/${trimmed}`);
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 mb-4">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-3xl" style={{ color: "var(--brown-dark)" }}>Word Box</h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--brown-light)" }}>
            Введи свой код — и вперёд!
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-sm border p-8"
          style={{ borderColor: "var(--brown-pale)" }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-center"
                style={{ color: "var(--brown-mid)" }}>
                Код доступа
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                autoFocus
                maxLength={20}
                className="w-full rounded-xl px-4 py-3 text-center text-xl font-bold tracking-widest focus:outline-none transition"
                style={{
                  background: "#fdf8f0",
                  border: "1.5px solid var(--brown-pale)",
                  color: "var(--brown-dark)",
                  letterSpacing: "0.2em",
                }}
                placeholder="ABC123"
              />
              <p className="text-xs text-center mt-2" style={{ color: "var(--brown-light)" }}>
                Код выдаёт твой репетитор
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl px-4 py-3 text-white font-semibold transition-opacity disabled:opacity-50"
              style={{ background: "var(--brown-light)" }}
            >
              {loading ? "Загрузка..." : "Открыть кабинет →"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "var(--brown-light)" }}>
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
