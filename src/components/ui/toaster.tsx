"use client";

import { useEffect, useState } from "react";

type ToastItem = { id: number; message: string; ok: boolean };

// Module-level singleton — works without context
const handlers: Array<(t: ToastItem) => void> = [];

export function showToast(message: string, ok = true) {
  const item: ToastItem = { id: Date.now(), message, ok };
  handlers.forEach(h => h(item));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (item: ToastItem) => {
      setItems(prev => [...prev, item]);
      setTimeout(() => setItems(prev => prev.filter(t => t.id !== item.id)), 2500);
    };
    handlers.push(handler);
    return () => {
      const i = handlers.indexOf(handler);
      if (i > -1) handlers.splice(i, 1);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-[9999] flex flex-col items-center gap-2 pointer-events-none px-4">
      {items.map(t => (
        <div
          key={t.id}
          className="px-5 py-3 rounded-2xl text-sm font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{ background: t.ok ? "#2A6E38" : "#9B1C1C" }}
        >
          {t.ok ? "✓ " : "✗ "}{t.message}
        </div>
      ))}
    </div>
  );
}
