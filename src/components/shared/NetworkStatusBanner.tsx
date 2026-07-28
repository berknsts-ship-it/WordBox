"use client";

import { useEffect, useState } from "react";

export default function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    let reconnectTimer: ReturnType<typeof setTimeout>;

    function handleOnline() {
      setIsOnline(true);
      setJustReconnected(true);
      reconnectTimer = setTimeout(() => setJustReconnected(false), 3000);
    }
    function handleOffline() {
      setIsOnline(false);
      setJustReconnected(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearTimeout(reconnectTimer);
    };
  }, []);

  if (isOnline && !justReconnected) return null;

  return (
    <div
      role="status"
      className="fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-2 py-2 text-sm font-medium text-white transition-colors"
      style={{ background: isOnline ? "#2e7d32" : "#74070E" }}
    >
      {isOnline
        ? "Соединение восстановлено"
        : "Нет соединения с интернетом — проверьте подключение, несохранённые действия нужно будет повторить"}
    </div>
  );
}
