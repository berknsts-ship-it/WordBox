"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function MaterialPdfViewer({ url, title }: { url: string; title: string }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (!isMobile) {
    return (
      <div className="-mx-5 sm:-mx-7 mt-2">
        <iframe
          src={url}
          title={title}
          className="w-full border-0"
          style={{ height: "82vh" }}
        />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
        style={{ background: "var(--gradient-primary)", color: "#fff" }}
      >
        📖 Открыть PDF в браузере ↗
      </a>
      <p className="text-xs mt-2 text-center" style={{ color: "var(--brown-light)" }}>
        Файл откроется во встроенном просмотрщике
      </p>
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
      <div className="text-center py-8 space-y-3">
        <p className="text-sm" style={{ color: "var(--brown-mid)" }}>{error}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "var(--gradient-primary)", color: "#fff" }}
        >
          Открыть PDF ↗
        </a>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--brown-pale)" }}>
      <div className="flex items-center justify-between px-4 py-2 border-b"
        style={{ background: "var(--cream)", borderColor: "var(--brown-pale)" }}>
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
        <canvas
          ref={canvasRef}
          style={{ display: loading ? "none" : "block", width: "100%", height: "auto" }}
        />
      </div>
    </div>
  );
}
