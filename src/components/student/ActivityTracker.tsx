"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { logActivity, type ActivityEventType } from "@/app/actions/activity";

const TAB_EVENTS: Partial<Record<string, ActivityEventType>> = {
  trainer: "trainer_open",
  grammar: "grammar_open",
  vocabulary: "vocabulary_open",
};

// No visible output — just watches which tab/route the student is on and
// logs the meaningful ones (trainer/grammar/vocabulary tabs, the board),
// deduped so switching back and forth between the same two tabs doesn't
// spam the log. Mounted once in [code]/layout.tsx, so it also fires for
// the tab the student lands on directly (a bookmark, a link the tutor
// sent) — not just tabs reached by clicking around.
export default function ActivityTracker({ code }: { code: string }) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const isBoard = pathname.endsWith("/board");
  const tab = searchParams.get("tab") ?? "schedule";
  const prevKey = useRef<string | null>(null);

  useEffect(() => {
    const key = isBoard ? "board" : tab;
    if (prevKey.current === key) return;
    prevKey.current = key;
    const eventType = isBoard ? "board_open" : TAB_EVENTS[tab];
    if (eventType) logActivity(code, eventType);
  }, [code, isBoard, tab]);

  return null;
}
