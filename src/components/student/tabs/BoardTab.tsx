"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useTransition } from "react";
import type { WhiteboardRef } from "@/components/shared/WhiteboardCanvas";
import { saveSnapshot, deleteSnapshot, getSnapshotItems, renameSnapshot } from "@/app/actions/board";
import { Save, BookOpen, Trash2, Download, Plus, ChevronRight, GitMerge, Check, Pencil } from "lucide-react";
import SyncedAudio from "@/components/shared/SyncedAudio";
import SyncedVideo from "@/components/shared/SyncedVideo";

const WhiteboardCanvas = dynamic(
  () => import("@/components/shared/WhiteboardCanvas"),
  { ssr: false, loading: () => <div className="flex-1 rounded-3xl animate-pulse" style={{ background: "var(--brown-pale)", minHeight: 400 }} /> }
);

type Snapshot = {
  id: string;
  title: string;
  created_at: string;
  lesson_id: string | null;
  lessons?: { scheduled_at: string } | null;
};

export default function BoardTab({
  studentId,
  snapshots: initialSnapshots = [],
  role = "student",
  boardUrl = null,
}: {
  studentId: string;
  snapshots?: Snapshot[];
  role?: "tutor" | "student";
  boardUrl?: string | null;
}) {
  const canvasRef = useRef<WhiteboardRef>(null);

  const [snapshots,    setSnapshots]    = useState<Snapshot[]>(initialSnapshots);
  const [showHistory,  setShowHistory]  = useState(false);
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [saving,       startSave]       = useTransition();
  const [saveTitle,    setSaveTitle]    = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [editTitle,    setEditTitle]    = useState("");

  const handleSave = async () => {
    const items = canvasRef.current?.getItems() ?? [];
    if (items.length === 0) return;
    startSave(async () => {
      const title = saveTitle.trim() || new Date().toLocaleDateString("ru", { day: "numeric", month: "long" });
      await saveSnapshot(studentId, title, items);
      setSaveTitle(""); setShowSaveForm(false);
      setSnapshots(prev => [{
        id: crypto.randomUUID(), title,
        created_at: new Date().toISOString(), lesson_id: null, lessons: null,
      }, ...prev]);
    });
  };

  const handleLoad = async (id: string) => {
    const items = await getSnapshotItems(id);
    canvasRef.current?.loadItems(items as Parameters<WhiteboardRef["loadItems"]>[0]);
    setShowHistory(false);
  };

  const handleMerge = async () => {
    for (const id of selected) {
      const items = await getSnapshotItems(id);
      canvasRef.current?.mergeItems(items as Parameters<WhiteboardRef["mergeItems"]>[0]);
    }
    setSelected(new Set()); setShowHistory(false);
  };

  const handleDelete = async (id: string) => {
    await deleteSnapshot(id);
    setSnapshots(prev => prev.filter(s => s.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return;
    await renameSnapshot(id, editTitle.trim());
    setSnapshots(prev => prev.map(s => s.id === id ? { ...s, title: editTitle.trim() } : s));
    setEditingId(null);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ru", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{
      "--brown-dark":  "#4A1414",
      "--brown-mid":   "#9C7A45",
      "--brown-light": "#7A6050",
      "--brown-pale":  "rgba(156,122,69,0.22)",
    } as React.CSSProperties}>
      {/* Toolbar */}
      {role === "tutor" && (
        <div className="flex items-center gap-2 px-3 py-2 border-b flex-wrap shrink-0"
          style={{ borderColor: "var(--brown-pale)", background: "white" }}>
          {showSaveForm ? (
            <div className="flex items-center gap-2">
              <input value={saveTitle} onChange={e => setSaveTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSave()}
                placeholder={new Date().toLocaleDateString("ru", { day: "numeric", month: "long" })}
                autoFocus
                className="text-sm px-3 py-1 rounded-lg border outline-none"
                style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)", width: 200 }} />
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1 text-sm px-3 py-1 rounded-lg font-medium text-white"
                style={{ background: "var(--gradient-primary)", opacity: saving ? 0.6 : 1 }}>
                <Save size={13}/> {saving ? "Сохраняю..." : "Сохранить"}
              </button>
              <button onClick={() => setShowSaveForm(false)}
                className="text-sm px-2 py-1 rounded-lg border"
                style={{ borderColor: "var(--brown-pale)", color: "var(--brown-light)" }}>
                Отмена
              </button>
            </div>
          ) : (
            <button onClick={() => setShowSaveForm(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg font-medium border-2 hover:opacity-80"
              style={{ borderColor: "var(--brown-mid)", color: "var(--brown-mid)" }}>
              <Save size={13}/> Сохранить конспект
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {boardUrl && (
              <a href={boardUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg font-medium border-2 hover:opacity-80"
                style={{ borderColor: "var(--brown-pale)", color: "var(--brown-light)" }}>
                🔗 Внешняя
              </a>
            )}
            <button onClick={() => setShowHistory(h => !h)}
              className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg font-medium border-2 hover:opacity-80"
              style={{
                borderColor: showHistory ? "var(--brown-dark)" : "var(--brown-pale)",
                color: "var(--brown-dark)",
                background: showHistory ? "var(--brown-pale)" : "transparent",
              }}>
              <BookOpen size={13}/> История {snapshots.length > 0 && `(${snapshots.length})`}
              <ChevronRight size={12} style={{ transform: showHistory ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas + Audio/Video */}
        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex flex-col flex-1 overflow-hidden min-h-0">
            <WhiteboardCanvas ref={canvasRef} roomId={studentId} role={role} />
          </div>
          <SyncedAudio roomId={studentId} role={role} />
          <SyncedVideo roomId={studentId} role={role} />
        </div>

        {/* History panel */}
        {showHistory && role === "tutor" && (
          <div className="flex flex-col border-l shrink-0 overflow-hidden"
            style={{ width: 260, borderColor: "var(--brown-pale)", background: "white" }}>
            <div className="px-4 py-3 border-b flex items-center justify-between shrink-0"
              style={{ borderColor: "var(--brown-pale)" }}>
              <span className="font-semibold text-sm" style={{ color: "var(--brown-dark)" }}>Конспекты</span>
              {selected.size >= 2 && (
                <button onClick={handleMerge}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium text-white"
                  style={{ background: "var(--gradient-primary)" }}>
                  <GitMerge size={12}/> Объединить ({selected.size})
                </button>
              )}
            </div>

            {snapshots.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-2">
                <div className="text-3xl">📓</div>
                <p className="text-sm font-medium" style={{ color: "var(--brown-dark)" }}>Нет конспектов</p>
                <p className="text-xs" style={{ color: "var(--brown-light)" }}>
                  Нарисуй что-нибудь и нажми «Сохранить конспект»
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {snapshots.map(snap => (
                  <div key={snap.id} className="border-b px-3 py-3 group"
                    style={{ borderColor: "var(--brown-pale)", background: selected.has(snap.id) ? "var(--brown-pale)" : "white" }}>
                    <div className="flex items-start gap-2">
                      <button onClick={() => toggleSelect(snap.id)}
                        className="shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                        style={{ borderColor: selected.has(snap.id) ? "var(--brown-dark)" : "var(--brown-pale)",
                                 background: selected.has(snap.id) ? "var(--brown-dark)" : "white" }}>
                        {selected.has(snap.id) && <Check size={9} color="white" strokeWidth={3}/>}
                      </button>
                      <div className="flex-1 min-w-0">
                        {editingId === snap.id ? (
                          <form onSubmit={e => { e.preventDefault(); handleRename(snap.id); }} className="flex gap-1">
                            <input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)}
                              className="flex-1 text-sm px-2 py-0.5 rounded border outline-none min-w-0"
                              style={{ borderColor: "var(--brown-dark)", color: "var(--brown-dark)" }} />
                            <button type="submit" className="text-xs px-1.5 py-0.5 rounded text-white shrink-0"
                              style={{ background: "var(--gradient-primary)" }}><Check size={11}/></button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium truncate" style={{ color: "var(--brown-dark)" }}>
                              {snap.title}
                            </span>
                            <button onClick={() => { setEditingId(snap.id); setEditTitle(snap.title); }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              style={{ color: "var(--brown-light)" }}>
                              <Pencil size={11}/>
                            </button>
                          </div>
                        )}
                        <div className="text-xs mt-0.5" style={{ color: "var(--brown-light)" }}>
                          {snap.lessons?.scheduled_at
                            ? `Урок ${fmtDate(snap.lessons.scheduled_at)}`
                            : fmtDate(snap.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-2 ml-6">
                      <button onClick={() => handleLoad(snap.id)}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border font-medium hover:opacity-80 flex-1 justify-center"
                        style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}>
                        <Download size={11}/> Загрузить
                      </button>
                      <button onClick={() => toggleSelect(snap.id)}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border font-medium hover:opacity-80 flex-1 justify-center"
                        style={{ borderColor: selected.has(snap.id) ? "var(--brown-dark)" : "var(--brown-pale)",
                                 color: "var(--brown-dark)", background: selected.has(snap.id) ? "var(--brown-pale)" : "transparent" }}>
                        <Plus size={11}/> Объединить
                      </button>
                      <button onClick={() => handleDelete(snap.id)}
                        className="flex items-center justify-center text-xs p-1 rounded-lg border hover:opacity-80"
                        style={{ borderColor: "#f0c0b0", color: "#c06040" }}>
                        <Trash2 size={11}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
