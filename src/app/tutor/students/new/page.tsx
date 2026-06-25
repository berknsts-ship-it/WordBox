import { addStudent } from "@/app/actions/students";
import Link from "next/link";

export default function NewStudentPage() {
  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/tutor/students" className="text-sm hover:underline"
          style={{ color: "var(--brown-light)" }}>
          ← Ученики
        </Link>
      </div>

      <h1 className="text-2xl mb-6">Новый ученик</h1>

      <div className="bg-white/80 rounded-3xl border p-8"
        style={{ borderColor: "var(--brown-pale)" }}>
        <form action={addStudent} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5"
              style={{ color: "var(--brown-mid)" }}>
              Имя *
            </label>
            <input
              name="name"
              required
              autoFocus
              placeholder="Например: Маша"
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
              style={{
                background: "var(--cream)",
                border: "1.5px solid var(--brown-pale)",
                color: "var(--brown-dark)",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5"
              style={{ color: "var(--brown-mid)" }}>
              Email (необязательно)
            </label>
            <input
              name="email"
              type="email"
              placeholder="masha@example.com"
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
              style={{
                background: "var(--cream)",
                border: "1.5px solid var(--brown-pale)",
                color: "var(--brown-dark)",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5"
              style={{ color: "var(--brown-mid)" }}>
              Заметки (необязательно)
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Уровень, цели, особенности..."
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
              style={{
                background: "var(--cream)",
                border: "1.5px solid var(--brown-pale)",
                color: "var(--brown-dark)",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5"
              style={{ color: "var(--brown-mid)" }}>
              Учебник (необязательно)
            </label>
            <select
              name="textbook"
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            >
              <option value="">Не выбран</option>
              <option value="english_file_elementary">English File Elementary</option>
              <option value="solutions_elementary">Solutions 3rd Ed. Elementary</option>
            </select>
          </div>

          <div className="rounded-2xl p-4 text-sm"
            style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}>
            🔑 Код доступа сгенерируется автоматически — ты сможешь поделиться им с учеником
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/tutor/students"
              className="flex-1 text-center rounded-xl px-4 py-3 text-sm font-semibold border transition-colors hover:opacity-80"
              style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}
            >
              Отмена
            </Link>
            <button
              type="submit"
              className="flex-1 rounded-xl px-4 py-3 text-white text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
            >
              Добавить ученика
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
