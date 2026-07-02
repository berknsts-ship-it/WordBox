"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function PdfReader({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
        style={open
          ? { background: "var(--brown-mid)", color: "#fff" }
          : { background: "var(--brown-pale)", color: "var(--brown-dark)" }}
      >
        <span>{open ? "✕" : "📖"}</span>
        {open ? "Свернуть" : "Читать"}
      </button>

      {open && (
        isMobile
          ? <MobilePdfReader url={url} title={title} />
          : (
            <div className="mt-3 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--theme-card-border, var(--brown-pale))" }}>
              <iframe
                src={url}
                title={title}
                className="w-full border-0"
                style={{ height: "80vh" }}
              />
            </div>
          )
      )}
    </div>
  );
}

function MobilePdfReader({ url, title }: { url: string; title: string }) {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<unknown>(null);

  const renderPage = useCallback(async (doc: unknown, pageNum: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = doc as any;
    const pg = await d.getPage(pageNum);
    const scale = Math.min(2.5, (canvas.parentElement?.clientWidth ?? 360) / pg.getViewport({ scale: 1 }).width);
    const viewport = pg.getViewport({ scale });
    const ctx = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    await pg.render({ canvasContext: ctx, viewport }).promise;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjs.getDocument({ url }).promise;
        if (cancelled) return;
        docRef.current = doc;
        setTotal(doc.numPages);
        await renderPage(doc, 1);
      } catch {
        if (!cancelled) setError("Не удалось загрузить PDF");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [url, renderPage]);

  async function goPage(delta: number) {
    if (!docRef.current) return;
    const next = Math.max(1, Math.min(total, page + delta));
    if (next === page) return;
    setPage(next);
    setLoading(true);
    await renderPage(docRef.current, next);
    setLoading(false);
  }

  if (error) {
    return (
      <div className="mt-3 text-center py-8 space-y-3">
        <p className="text-sm" style={{ color: "var(--brown-mid)" }}>{error}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "var(--theme-accent, var(--brown-mid))", color: "#fff" }}
        >
          Открыть PDF ↗
        </a>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--theme-card-border, var(--brown-pale))" }}>
      <div className="flex items-center justify-between px-4 py-2 border-b"
        style={{ background: "var(--cream)", borderColor: "var(--theme-card-border, var(--brown-pale))" }}>
        <span className="text-xs font-semibold truncate max-w-[60%]" style={{ color: "var(--brown-mid)" }}>
          {title}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          {total > 1 && (
            <div className="flex items-center gap-1.5">
              <button onClick={() => goPage(-1)} disabled={page <= 1 || loading}
                className="w-7 h-7 flex items-center justify-center rounded-lg border disabled:opacity-30"
                style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}>‹</button>
              <span className="text-xs" style={{ color: "var(--brown-mid)" }}>{page} / {total}</span>
              <button onClick={() => goPage(1)} disabled={page >= total || loading}
                className="w-7 h-7 flex items-center justify-center rounded-lg border disabled:opacity-30"
                style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}>›</button>
            </div>
          )}
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="text-xs font-semibold" style={{ color: "var(--brown-light)" }}>
            ↗
          </a>
        </div>
      </div>
      <div className="bg-gray-100 relative" style={{ minHeight: 240 }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm" style={{ color: "var(--brown-light)" }}>Загрузка...</span>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: loading ? "none" : "block", width: "100%", height: "auto" }} />
      </div>
    </div>
  );
}
