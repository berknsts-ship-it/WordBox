"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";

export default function PushSubscribeButton({ studentId }: { studentId: string }) {
  const [state, setState] = useState<"loading" | "unsupported" | "denied" | "subscribed" | "unsubscribed">("loading");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported"); return;
    }
    if (Notification.permission === "denied") { setState("denied"); return; }

    navigator.serviceWorker.register("/sw.js").then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setState(sub ? "subscribed" : "unsubscribed");
      });
    });
  }, []);

  const subscribe = async () => {
    setState("loading");
    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { console.error("[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set"); setState("unsubscribed"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, subscription: sub.toJSON() }),
      });
      console.log("[push] saved subscription, status:", res.status);
      setState("subscribed");
    } catch (err) {
      console.error("[push] subscribe error:", err);
      setState(Notification.permission === "denied" ? "denied" : "unsubscribed");
    }
  };

  const unsubscribe = async () => {
    setState("loading");
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      await fetch("/api/push", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, endpoint: sub.endpoint }),
      });
    }
    setState("unsubscribed");
  };

  if (state === "unsupported") return null;
  if (state === "loading") return (
    <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl opacity-40"
      style={{ background: "var(--theme-card-bg)", color: "var(--theme-text-muted)" }}>
      <Bell size={13}/> Уведомления
    </div>
  );

  if (state === "denied") return (
    <div className="flex flex-col gap-1.5 px-3 py-2 rounded-xl text-xs"
      style={{ background: "var(--theme-card-bg)", color: "var(--theme-text)", maxWidth: 240 }}>
      <div className="flex items-center gap-1.5 font-semibold">
        <BellOff size={13}/> Уведомления заблокированы
      </div>
      <div style={{ color: "var(--theme-text-muted)", lineHeight: 1.5 }}>
        Нажми 🔒 у адресной строки → Настройки сайта → Уведомления → Разрешить → обнови страницу
      </div>
    </div>
  );

  if (state === "subscribed") return (
    <button onClick={unsubscribe}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
      style={{ background: "var(--theme-accent)", color: "white" }}>
      <BellRing size={13}/> Уведомления включены
    </button>
  );

  return (
    <button onClick={subscribe}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
      style={{ background: "var(--theme-card-bg)", color: "var(--theme-text-muted)" }}>
      <Bell size={13}/> Включить уведомления
    </button>
  );
}
