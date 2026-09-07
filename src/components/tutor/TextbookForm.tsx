"use client";

import { useTransition } from "react";
import { updateTextbook } from "@/app/actions/students";
import { showToast } from "@/components/ui/toaster";

export type TextbookOption = { value: string; label: string };

export function TextbookForm({ studentId, current, options }: {
  studentId: string;
  current: string | null;
  // Derived from the tutor's actual vocabulary_folders (see students/[id]/page.tsx)
  // rather than a hardcoded list — a new folder becomes selectable here with no
  // code change.
  options: TextbookOption[];
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateTextbook(studentId, formData);
      showToast("Учебник сохранён");
    });
  }

  return (
    <div className="space-y-1.5">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <select
          name="textbook"
          defaultValue={current ?? ""}
          className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
          style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
        >
          <option value="">— не выбран —</option>
          {options.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white shrink-0 hover:opacity-90 transition-all"
          style={{ background: "var(--gradient-primary)", opacity: pending ? 0.65 : 1 }}
        >
          {pending ? "Сохраняем..." : "Сохранить"}
        </button>
      </form>
      <p className="text-xs" style={{ color: "var(--brown-light)" }}>
        Подключит справочник по грамматике и словарь этого учебника ученику — уже назначенное не убирается.
      </p>
    </div>
  );
}
