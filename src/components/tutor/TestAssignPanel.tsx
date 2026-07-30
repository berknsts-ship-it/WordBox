"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { assignTestToStudents } from "@/app/actions/tests";

interface Student { id: string; name: string; }

export default function TestAssignPanel({
  testId,
  allStudents,
  currentStudentId,
}: {
  testId: string;
  allStudents: Student[];
  currentStudentId: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => new Set(currentStudentId ? [currentStudentId] : []));
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const toggle = (id: string) => {
    if (id === currentStudentId) return; // already assigned to this test — not removable here
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = () => {
    setResult(null);
    startTransition(async () => {
      const res = await assignTestToStudents(testId, [...selected]);
      if (res.error) { setResult(res.error); return; }
      const created = res.created ?? 0;
      setResult(
        created > 0
          ? `Готово: создано копий — ${created}`
          : currentStudentId ? null : "Назначено"
      );
      router.refresh();
    });
  };

  const cancel = () => {
    setSelected(new Set(currentStudentId ? [currentStudentId] : []));
    setOpen(false);
    setResult(null);
  };

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all hover:opacity-80"
        style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}
      >
        <Users size={13} /> Назначить ещё
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={cancel} />
          <div
            className="absolute left-0 top-full mt-1 z-20 rounded-xl border shadow-xl overflow-hidden"
            style={{ background: "white", borderColor: "var(--brown-pale)", minWidth: 220 }}
          >
            <div className="px-4 pt-3 pb-1 text-xs" style={{ color: "var(--brown-light)" }}>
              Выберите учеников — для каждого нового создастся копия теста с теми же вопросами
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {allStudents.length === 0 ? (
                <p className="px-4 py-3 text-sm" style={{ color: "var(--brown-light)" }}>
                  Нет учеников
                </p>
              ) : (
                allStudents.map((s) => {
                  const isCurrent = s.id === currentStudentId;
                  return (
                    <label
                      key={s.id}
                      className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0"
                      style={{
                        borderColor: "var(--brown-pale)",
                        cursor: isCurrent ? "default" : "pointer",
                        opacity: isCurrent ? 0.6 : 1,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={() => toggle(s.id)}
                        disabled={isCurrent}
                        className="w-4 h-4 accent-amber-700 cursor-pointer"
                      />
                      <span className="text-sm" style={{ color: "var(--brown-dark)" }}>
                        {s.name}{isCurrent && " (уже этот тест)"}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
            {result && (
              <p className="px-4 py-2 text-xs" style={{ color: result.includes("создано") || result === "Назначено" ? "#1a7a3a" : "#cc3030" }}>
                {result}
              </p>
            )}
            <div
              className="flex gap-2 px-3 py-2.5 border-t"
              style={{ borderColor: "var(--brown-pale)", background: "var(--cream)" }}
            >
              <button
                onClick={save}
                disabled={pending}
                className="flex-1 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}
              >
                {pending ? "..." : "Сохранить"}
              </button>
              <button
                onClick={cancel}
                className="px-3 py-1.5 rounded-lg border text-sm"
                style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
