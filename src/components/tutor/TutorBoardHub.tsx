"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { getSnapshots } from "@/app/actions/board";

const BoardTab = dynamic(
  () => import("@/components/student/tabs/BoardTab"),
  { ssr: false, loading: () => <div className="flex-1 animate-pulse" style={{ background: "var(--brown-pale)" }} /> }
);

type Student = { id: string; name: string; canvas_url: string | null };
type Snapshot = { id: string; title: string; created_at: string; lesson_id: string | null; lessons?: { scheduled_at: string } | null };

export default function TutorBoardHub({
  students,
  initialId,
  initialSnapshots,
}: {
  students: Student[];
  initialId: string | null;
  initialSnapshots: Snapshot[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialId ?? students[0]?.id ?? null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(initialSnapshots);
  const [loading, startTransition] = useTransition();

  function selectStudent(id: string) {
    if (id === selectedId) return;
    setSelectedId(id);
    setSnapshots([]);
    startTransition(async () => {
      const snaps = await getSnapshots(id);
      setSnapshots(snaps as unknown as Snapshot[]);
    });
  }

  const student = students.find(s => s.id === selectedId) ?? null;

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border" style={{ height: "calc(100dvh - 9.5rem)", borderColor: "var(--brown-pale)" }}>

      {/* Mobile: горизонтальный скролл учеников */}
      <div className="sm:hidden flex items-center gap-1.5 px-3 py-2 border-b overflow-x-auto shrink-0"
        style={{ borderColor: "var(--brown-pale)", background: "white" }}>
        {students.length === 0 && (
          <span className="text-xs" style={{ color: "var(--brown-light)" }}>Нет учеников</span>
        )}
        {students.map(s => (
          <button
            key={s.id}
            onClick={() => selectStudent(s.id)}
            className="shrink-0 px-3 py-1 rounded-xl text-sm font-medium transition-all"
            style={{
              background: selectedId === s.id ? "linear-gradient(135deg, #5e1018, #74070E)" : "rgba(156,122,69,0.10)",
              color: selectedId === s.id ? "#EDE0CC" : "var(--brown-dark)",
              opacity: loading && selectedId === s.id ? 0.6 : 1,
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Desktop: классический сайдбар */}
      <div className="hidden sm:flex flex-1 overflow-hidden min-h-0">
        <div className="flex flex-col shrink-0 border-r overflow-hidden"
          style={{ width: 192, borderColor: "var(--brown-pale)", background: "white" }}>
          <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--brown-pale)" }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--brown-light)" }}>Ученики</p>
          </div>
          <div className="overflow-y-auto flex-1">
            {students.length === 0 && (
              <p className="text-xs px-4 py-3" style={{ color: "var(--brown-light)" }}>Нет учеников</p>
            )}
            {students.map(s => (
              <button
                key={s.id}
                onClick={() => selectStudent(s.id)}
                className="w-full text-left px-4 py-3 text-sm transition-all border-b last:border-0"
                style={{
                  borderColor: "var(--brown-pale)",
                  background: selectedId === s.id ? "var(--brown-pale)" : "transparent",
                  color: selectedId === s.id ? "var(--brown-dark)" : "var(--brown-light)",
                  fontWeight: selectedId === s.id ? 600 : 400,
                }}
              >
                <span className="block truncate">{s.name}</span>
                {loading && selectedId === s.id && (
                  <span className="text-xs" style={{ color: "var(--brown-light)" }}>загрузка...</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Доска (desktop) */}
        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
          {selectedId ? (
            <BoardTab
              studentId={selectedId}
              role="tutor"
              boardUrl={student?.canvas_url ?? null}
              snapshots={snapshots}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <p className="text-4xl mb-3">🖊</p>
                <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>Выбери ученика</p>
                <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>Кликни на имя в боковой панели</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Доска (mobile) */}
      <div className="sm:hidden flex-1 overflow-hidden flex flex-col min-w-0 min-h-0">
        {selectedId ? (
          <BoardTab
            studentId={selectedId}
            role="tutor"
            boardUrl={student?.canvas_url ?? null}
            snapshots={snapshots}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <p className="text-4xl mb-3">🖊</p>
              <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>Выбери ученика</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
