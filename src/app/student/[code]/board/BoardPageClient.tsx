"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const BoardTab = dynamic(
  () => import("@/components/student/tabs/BoardTab"),
  { ssr: false, loading: () => <div className="flex-1 animate-pulse" style={{ background: "#e8e8e8" }} /> }
);

export default function BoardPageClient({ studentId, myName }: { studentId: string; myName?: string }) {
  // The student layout's <main> has position:relative + an explicit z-index,
  // which makes it its own stacking context — trapping this div's z-50
  // underneath the layout's sticky header (z-20) no matter how high a
  // z-index it's given, since z-index only competes against siblings within
  // the same stacking context. A portal renders straight onto <body>,
  // outside that nesting, so the board's full-screen overlay actually
  // covers the header as intended instead of sitting visibly under it.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#e8e8e8" }}>
      <BoardTab studentId={studentId} role="student" myName={myName} />
    </div>,
    document.body
  );
}
