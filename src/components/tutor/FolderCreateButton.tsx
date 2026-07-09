"use client";

import { useState, useTransition } from "react";
import { FolderPlus } from "lucide-react";
import { createFolder } from "@/app/actions/vocabulary";

export default function FolderCreateButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      await createFolder(name.trim());
      setName("");
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border hover:opacity-70 transition-all"
        style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)", background: "white" }}
      >
        <FolderPlus size={15} /> Папка
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") setOpen(false); }}
        placeholder="Название папки"
        className="px-3 py-2 rounded-xl border text-sm outline-none"
        style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)", width: 180 }}
      />
      <button
        onClick={submit}
        disabled={pending || !name.trim()}
        className="px-3 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: "var(--gradient-primary)" }}
      >
        {pending ? "..." : "Создать"}
      </button>
      <button
        onClick={() => setOpen(false)}
        className="px-3 py-2 rounded-xl text-sm border"
        style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}
      >
        Отмена
      </button>
    </div>
  );
}
