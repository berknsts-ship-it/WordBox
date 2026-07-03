"use client";

import { useTransition } from "react";
import { updateHomeworkStatus, deleteHomework } from "@/app/actions/homework";
import { showToast } from "@/components/ui/toaster";

export function HomeworkActions({
  id,
  studentId,
  status,
}: {
  id: string;
  studentId: string;
  status: string;
}) {
  const [markPending, startMark] = useTransition();
  const [delPending,  startDel]  = useTransition();

  const markChecked = () => {
    startMark(async () => {
      await updateHomeworkStatus(id, studentId, "checked");
      showToast("Задание проверено ✓");
    });
  };

  const remove = () => {
    startDel(async () => {
      await deleteHomework(id, studentId);
      showToast("Задание удалено");
    });
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      {status === "submitted" && (
        <button
          onClick={markChecked}
          disabled={markPending}
          className="text-xs px-2.5 py-1 rounded-lg font-semibold hover:opacity-80 disabled:opacity-50"
          style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}
        >
          {markPending ? "..." : "✓ Проверено"}
        </button>
      )}
      <button
        onClick={remove}
        disabled={delPending}
        className="text-xs text-red-400 hover:text-red-600 px-1.5 py-1 disabled:opacity-50"
      >
        {delPending ? "..." : "✕"}
      </button>
    </div>
  );
}
