"use client";

import { useState, useTransition } from "react";
import { setStudentMaterials } from "@/app/actions/materials";
import { Library } from "lucide-react";

interface Material { id: string; title: string; file_name: string | null; url: string | null; is_iframe: boolean; }

interface Props {
  studentId: string;
  allMaterials: Material[];
  assignedMaterialIds: string[];
}

export default function StudentLibraryPanel({ studentId, allMaterials, assignedMaterialIds }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => new Set(assignedMaterialIds));
  const [pending, startTransition] = useTransition();

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const save = () => {
    startTransition(async () => {
      await setStudentMaterials(studentId, [...selected]);
      setOpen(false);
    });
  };

  const cancel = () => {
    setSelected(new Set(assignedMaterialIds));
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:opacity-80"
        style={{
          borderColor: selected.size > 0 ? "var(--brown-mid)" : "var(--brown-pale)",
          color: selected.size > 0 ? "var(--brown-dark)" : "var(--brown-light)",
          background: "white",
        }}
      >
        <Library size={13} />
        {selected.size === 0 ? "Из библиотеки" : `${selected.size} материала(ов)`}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={cancel} />
          <div
            className="absolute right-0 top-full mt-1 z-20 rounded-2xl border shadow-xl overflow-hidden"
            style={{ background: "white", borderColor: "var(--brown-pale)", minWidth: 240, maxWidth: 300 }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--brown-pale)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--brown-mid)" }}>
                Назначить материалы из библиотеки
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {allMaterials.length === 0 && (
                <p className="px-4 py-4 text-sm" style={{ color: "var(--brown-light)" }}>
                  Библиотека пуста. <a href="/tutor/materials/new" className="underline">Добавить?</a>
                </p>
              )}
              {allMaterials.map(m => {
                const icon = m.is_iframe ? "🖥️" : m.file_name ? "📎" : m.url ? "🔗" : "📄";
                return (
                  <label
                    key={m.id}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:opacity-80 transition-all border-b last:border-0"
                    style={{ borderColor: "var(--brown-pale)" }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(m.id)}
                      onChange={() => toggle(m.id)}
                      className="w-4 h-4 accent-amber-700 cursor-pointer shrink-0"
                    />
                    <span className="text-sm truncate" style={{ color: "var(--brown-dark)" }}>
                      {icon} {m.title}
                    </span>
                  </label>
                );
              })}
            </div>

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
                Отмена
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
