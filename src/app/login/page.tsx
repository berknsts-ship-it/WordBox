"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Неверный email или пароль");
      setLoading(false);
      return;
    }
    router.push("/tutor/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-3xl" style={{ color: "var(--brown-dark)" }}>Word Box</h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--brown-light)" }}>
            Кабинет репетитора
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-sm border p-8"
          style={{ borderColor: "var(--brown-pale)" }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5"
                style={{ color: "var(--brown-mid)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition"
                style={{
                  background: "#fdf8f0",
                  border: "1.5px solid var(--brown-pale)",
                  color: "var(--brown-dark)",
                }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5"
                style={{ color: "var(--brown-mid)" }}>
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                style={{
                  background: "#fdf8f0",
                  border: "1.5px solid var(--brown-pale)",
                  color: "var(--brown-dark)",
                }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-sm rounded-xl px-4 py-3 bg-red-50 text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl px-4 py-3 text-white font-semibold transition-opacity disabled:opacity-50"
              style={{ background: "var(--brown-mid)" }}
            >
              {loading ? "Входим..." : "Войти"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "var(--brown-light)" }}>
          Ты ученик?{" "}
          <a href="/student" className="font-semibold hover:underline"
            style={{ color: "var(--brown-mid)" }}>
            Войди по коду
          </a>
        </p>
      </div>
    </div>
  );
}
