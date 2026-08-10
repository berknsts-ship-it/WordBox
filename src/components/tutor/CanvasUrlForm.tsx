"use client";

import { useTransition } from "react";
import { updateCanvasUrl } from "@/app/actions/students";
import { showToast } from "@/components/ui/toaster";

export function CanvasUrlForm({ studentId, current }: { studentId: string; current: string | null }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateCanvasUrl(studentId, formData);
      showToast("Ссылка сохранена");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <input
        type="url"
        name="canvas_url"
        defaultValue={current ?? ""}
        placeholder="Например: ссылка на доску в Miro"
        className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
        style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
      />
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 rounded-xl text-sm font-semibold text-white shrink-0 hover:opacity-90 transition-all"
        style={{ background: "var(--gradient-primary)", opacity: pending ? 0.65 : 1 }}
      >
        {pending ? "Сохраняем..." : "Сохранить"}
      </button>
    </form>
  );
}
