"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateTelegramLink, unlinkTelegram, updateNotifyChannels } from "@/app/actions/telegram";
import { Bell, Check, Copy, ExternalLink } from "lucide-react";

const CHANNELS = [
  { key: "telegram", label: "Telegram",  desc: "Через бота T-Kit" },
  { key: "push",     label: "Push",      desc: "В браузере / на телефоне" },
];

export default function SettingsPage() {
  const [loading,          setLoading]          = useState(true);
  const [telegramChatId,   setTelegramChatId]   = useState<string | null>(null);
  const [notifyChannels,   setNotifyChannels]   = useState<Record<string, boolean>>({ telegram: true, push: true });
  const [tgLinkUrl,        setTgLinkUrl]        = useState<string | null>(null);
  const [tgLinkLoading,    setTgLinkLoading]    = useState(false);
  const [tgCopied,         setTgCopied]         = useState(false);
  const [unlinkLoading,    setUnlinkLoading]    = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("tutors")
        .select("telegram_chat_id, notify_channels")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          setTelegramChatId(data?.telegram_chat_id ?? null);
          setNotifyChannels(data?.notify_channels ?? { telegram: true, push: true });
          setLoading(false);
        });
    });
  }, []);

  async function handleGenerateTgLink() {
    setTgLinkLoading(true);
    const res = await generateTelegramLink();
    setTgLinkLoading(false);
    if ("error" in res) return;
    setTgLinkUrl(res.url);
  }

  async function handleUnlink() {
    setUnlinkLoading(true);
    await unlinkTelegram();
    setTelegramChatId(null);
    setTgLinkUrl(null);
    setUnlinkLoading(false);
  }

  const handleToggleChannel = useCallback(async (key: string, val: boolean) => {
    const next = { ...notifyChannels, [key]: val };
    setNotifyChannels(next);
    updateNotifyChannels(next).catch(() => {});
  }, [notifyChannels]);

  function copyLink(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setTgCopied(true);
      setTimeout(() => setTgCopied(false), 2000);
    });
  }

  const card = { background: "var(--cream)", borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "var(--brown-dark)" }}>Настройки</h1>

      <div className="rounded-2xl border p-6" style={card}>
        <div className="flex items-center gap-2 mb-5">
          <Bell size={18} style={{ color: "var(--brown-mid)" }} />
          <h2 className="font-semibold" style={{ color: "var(--brown-dark)" }}>Уведомления</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-10 rounded-xl animate-pulse" style={{ background: "var(--brown-pale)" }} />
            <div className="h-10 rounded-xl animate-pulse" style={{ background: "var(--brown-pale)" }} />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Telegram */}
            <div className="rounded-xl p-4 space-y-3" style={{ background: "white", border: "1px solid var(--brown-pale)" }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--brown-dark)" }}>Telegram</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--brown-mid)" }}>
                    {telegramChatId ? "✓ Подключён" : "Не подключён"}
                  </p>
                </div>
                {telegramChatId ? (
                  <button onClick={handleUnlink} disabled={unlinkLoading}
                    className="text-xs px-3 py-1.5 rounded-lg border"
                    style={{ borderColor: "var(--brown-light)", color: "var(--brown-mid)", opacity: unlinkLoading ? 0.6 : 1 }}>
                    {unlinkLoading ? "..." : "Отвязать"}
                  </button>
                ) : tgLinkUrl ? (
                  <div className="flex items-center gap-2">
                    <a href={tgLinkUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white"
                      style={{ background: "#229ED9" }}>
                      <ExternalLink size={12}/> Открыть бота
                    </a>
                    <button onClick={() => copyLink(tgLinkUrl)}
                      className="text-xs px-2 py-1.5 rounded-lg border"
                      style={{ borderColor: "var(--brown-light)", color: "var(--brown-mid)" }}>
                      {tgCopied ? <Check size={12}/> : <Copy size={12}/>}
                    </button>
                  </div>
                ) : (
                  <button onClick={handleGenerateTgLink} disabled={tgLinkLoading}
                    className="text-xs px-3 py-1.5 rounded-lg text-white"
                    style={{ background: "#229ED9", opacity: tgLinkLoading ? 0.7 : 1 }}>
                    {tgLinkLoading ? "..." : "Подключить"}
                  </button>
                )}
              </div>
              {tgLinkUrl && !telegramChatId && (
                <p className="text-xs" style={{ color: "var(--brown-mid)" }}>
                  Ссылка действительна 15 минут. Нажми «Открыть бота» и отправь /start.
                </p>
              )}
            </div>

            {/* Channel toggles */}
            <div>
              <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--brown-mid)" }}>Каналы</p>
              <div className="space-y-2">
                {CHANNELS.map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--brown-dark)" }}>{label}</p>
                      <p className="text-xs" style={{ color: "var(--brown-mid)" }}>{desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggleChannel(key, !notifyChannels[key])}
                      className="relative w-11 h-6 rounded-full transition-colors duration-200"
                      style={{ background: notifyChannels[key] ? "var(--brown-dark)" : "var(--brown-pale)" }}>
                      <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                        style={{ transform: notifyChannels[key] ? "translateX(20px)" : "translateX(0)" }} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: "var(--brown-light)" }}>Уведомления придут во все включённые каналы</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
