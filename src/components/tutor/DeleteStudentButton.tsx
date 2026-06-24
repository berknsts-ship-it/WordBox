"use client";

import { deleteStudent } from "@/app/actions/students";

export default function DeleteStudentButton({ studentId, studentName }: { studentId: string; studentName: string }) {
  return (
    <button
      onClick={async () => {
        if (!confirm(`Удалить ученика «${studentName}»? Это действие нельзя отменить.`)) return;
        await deleteStudent(studentId);
      }}
      className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors hover:bg-red-50 hover:text-red-600"
      style={{ color: "var(--brown-light)" }}
    >
      🗑 Удалить ученика
    </button>
  );
}
