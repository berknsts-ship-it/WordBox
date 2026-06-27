"use client";

import { useState } from "react";

export function PdfReader({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
        style={open
          ? { background: "var(--brown-mid)", color: "#fff" }
          : { background: "var(--brown-pale)", color: "var(--brown-dark)" }}
      >
        <span>{open ? "✕" : "📖"}</span>
        {open ? "Свернуть" : "Читать"}
      </button>

      {open && (
        <div className="mt-3 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--brown-pale)" }}>
          <div className="flex items-center justify-between px-4 py-2 border-b"
            style={{ background: "var(--cream)", borderColor: "var(--brown-pale)" }}>
            <span className="text-xs font-semibold truncate max-w-[70%]" style={{ color: "var(--brown-mid)" }}>
              {title}
            </span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold shrink-0"
              style={{ color: "var(--brown-light)" }}
            >
              Открыть отдельно ↗
            </a>
          </div>
          <iframe
            src={url}
            title={title}
            style={{ width: "100%", height: "clamp(500px, 72vh, 1000px)", border: "none", display: "block" }}
          />
        </div>
      )}
    </div>
  );
}
