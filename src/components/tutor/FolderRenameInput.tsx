"use client";

import { useState, useTransition } from "react";
import { renameFolder, deleteFolder } from "@/app/actions/vocabulary";
import { Pencil, Trash2, Check, X } from "lucide-react";

export default function FolderRenameInput({
  folderId,
  initialName,
  isEmpty,
}: {
  folderId: string;
  initialName: string;
  isEmpty: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [pending, startTransition] = useTransition();

  const save = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      await renameFolder(folderId, name.trim());
      setEditing(false);
    });
  };

  const del = () => {
    if (!confirm(`Удалить папку "${initialName}"?`)) return;
    startTransition(() => deleteFolder(folderId));
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") { setName(initialName); setEditing(false); } }}
          className="px-2 py-0.5 rounded-lg border text-sm font-semibold outline-none"
          style={{ borderColor: "var(--brown-mid)", color: "var(--brown-dark)", minWidth: 140 }}
        />
        <button onClick={save} disabled={pending} className="p-1 rounded-lg hover:opacity-70" style={{ color: "var(--brown-mid)" }}>
          <Check size={14} />
        </button>
        <button onClick={() => { setName(initialName); setEditing(false); }} className="p-1 rounded-lg hover:opacity-70" style={{ color: "var(--brown-light)" }}>
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 group/folder">
      <button
        onClick={e => { e.stopPropagation(); setEditing(true); }}
        className="p-1 rounded-lg opacity-0 group-hover/folder:opacity-100 transition-opacity hover:opacity-70"
        style={{ color: "var(--brown-light)" }}
        title="Переименовать"
      >
        <Pencil size={13} />
      </button>
      {isEmpty && (
        <button
          onClick={e => { e.stopPropagation(); del(); }}
          disabled={pending}
          className="p-1 rounded-lg opacity-0 group-hover/folder:opacity-100 transition-opacity hover:opacity-70 disabled:opacity-30"
          style={{ color: "var(--brown-light)" }}
          title="Удалить папку"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}
