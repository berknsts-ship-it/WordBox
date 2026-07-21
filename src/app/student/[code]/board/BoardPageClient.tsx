"use client";

import dynamic from "next/dynamic";

const BoardTab = dynamic(
  () => import("@/components/student/tabs/BoardTab"),
  { ssr: false, loading: () => <div className="flex-1 animate-pulse" style={{ background: "#e8e8e8" }} /> }
);

export default function BoardPageClient({ studentId }: { studentId: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#e8e8e8" }}>
      <BoardTab studentId={studentId} role="student" />
    </div>
  );
}
