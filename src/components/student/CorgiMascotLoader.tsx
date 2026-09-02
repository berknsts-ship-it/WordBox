"use client";

import dynamic from "next/dynamic";

// ssr:false keeps it out of the server render entirely (root layout is a
// Server Component, so this indirection is what lets us skip SSR for it —
// avoids a hydration flash from the localStorage-driven hidden/last-visit
// state, same pattern BoardPageClient already uses for the whiteboard).
const CorgiMascot = dynamic(() => import("./CorgiMascot"), { ssr: false });

export default function CorgiMascotLoader() {
  return <CorgiMascot />;
}
