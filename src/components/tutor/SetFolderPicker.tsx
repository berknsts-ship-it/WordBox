"use client";

import { useState, useTransition } from "react";
import { FolderOpen } from "lucide-react";
import { moveSetToFolder } from "@/app/actions/vocabulary";

interface Folder { id: string; name: string; }

export default function SetFolderPicker({
  setId,
  currentFolderId,
  folders,
}: {
  setId: string;
  currentFolderId: string | null;
  folders: Folder[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const current = folders.find(f => f.id === currentFolderId);

  const pick = (folderId: string | null) => {
    startTransition(async () => {
      await moveSetToFolder(setId, folderId);
      setOpen(false);
    });
  };

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={pending}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all hover:opacity-80"
        style={{
          borderColor: current ? "var(--brown-mid)" : "var(--brown-pale)",
          color: current ? "var(--brown-dark)" : "var(--brown-light)",
          background: "white",
        }}
      >
        <FolderOpen size={12} />
        {pending ? "..." : (current?.name ?? "Без папки")}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-20 rounded-xl border shadow-xl overflow-hidden"
            style={{ background: "white", borderColor: "var(--brown-pale)", minWidth: 200 }}
          >
            <button
              onClick={() => pick(null)}
              className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm hover:opacity-70 border-b"
              style={{ color: "var(--brown-light)", borderColor: "var(--brown-pale)", fontStyle: "italic" }}
            >
              Без папки
            </button>
            {folders.map(f => (
              <button
                key={f.id}
                onClick={() => pick(f.id)}
                className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm hover:opacity-70 border-b last:border-0"
                style={{
                  color: "var(--brown-dark)",
                  borderColor: "var(--brown-pale)",
                  fontWeight: f.id === currentFolderId ? 600 : 400,
                  background: f.id === currentFolderId ? "var(--cream)" : "transparent",
                }}
              >
                {f.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
