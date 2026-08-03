"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { setGrammarAssignments } from "@/app/actions/grammar";

interface Student { id: string; name: string; }
type Status = "not_started" | "in_progress" | "completed";

const STATUS_LABELS: Record<Status, string> = {
  not_started: "",
  in_progress: "в процессе",
  completed: "пройден",
};

export default function GrammarAssignPanel({
  setId,
  allStudents,
  assigned,
}: {
  setId: string;
  allStudents: Student[];
  assigned: { student_id: string; status: Status }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => new Set(assigned.map(a => a.student_id)));
  const [pending, startTransition] = useTransition();
  const statusById = new Map(assigned.map(a => [a.student_id, a.status]));

  const toggle = (id: string) => {
    if (statusById.get(id) && statusById.get(id) !== "not_started") return; // прогресс — не трогаем
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const save = () => {
    startTransition(async () => {
      await setGrammarAssignments(setId, [...selected]);
      setOpen(false);
      router.refresh();
    });
  };

  const cancel = () => {
    setSelected(new Set(assigned.map(a => a.student_id)));
    setOpen(false);
  };

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all hover:opacity-80"
        style={{
          borderColor: selected.size > 0 ? "var(--brown-mid)" : "var(--brown-pale)",
          color: selected.size > 0 ? "var(--brown-dark)" : "var(--brown-light)",
          background: "white",
        }}
      >
        <Users size={12} />
        {selected.size === 0 ? "Назначить" : `${selected.size} уч.`}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={cancel} />
          <div className="absolute right-0 top-full mt-1 z-20 rounded-xl border shadow-xl overflow-hidden"
            style={{ background: "white", borderColor: "var(--brown-pale)", minWidth: 220 }}>
            <div className="max-h-60 overflow-y-auto">
              {allStudents.length === 0 ? (
                <p className="px-4 py-3 text-sm" style={{ color: "var(--brown-light)" }}>Нет учеников</p>
              ) : (
                allStudents.map(s => {
                  const status = statusById.get(s.id);
                  const locked = !!status && status !== "not_started";
                  return (
                    <label key={s.id}
                      className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0"
                      style={{ borderColor: "var(--brown-pale)", cursor: locked ? "default" : "pointer", opacity: locked ? 0.7 : 1 }}>
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={() => toggle(s.id)}
                        disabled={locked}
                        className="w-4 h-4 accent-amber-700 cursor-pointer"
                      />
                      <span className="text-sm flex-1" style={{ color: "var(--brown-dark)" }}>{s.name}</span>
                      {locked && (
                        <span className="text-xs" style={{ color: "var(--brown-light)" }}>{STATUS_LABELS[status as Status]}</span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
            <div className="flex gap-2 px-3 py-2.5 border-t" style={{ borderColor: "var(--brown-pale)", background: "var(--cream)" }}>
              <button onClick={save} disabled={pending}
                className="flex-1 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}>
                {pending ? "..." : "Сохранить"}
              </button>
              <button onClick={cancel} className="px-3 py-1.5 rounded-lg border text-sm" style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}>
                Отмена
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
