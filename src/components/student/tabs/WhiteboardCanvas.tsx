"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ═══════ Types ═══════ */
type Tool = "select" | "pen" | "eraser";
type Ruling = "none" | "lines" | "calligraphy" | "grid";
type Pt = { x: number; y: number };
type Stroke = { id: string; pts: Pt[]; color: string; size: number };
type FunctionItem = {
  type: "function"; id: string; formula: string; color: string; lineWidth: number;
  x: number; y: number; w: number; h: number;
  xMin: number; xMax: number; yMin: number; yMax: number;
};
type Item = FunctionItem;
type BoardState = { strokes: Stroke[]; items: Item[] };

/* ═══════ Helpers ═══════ */
function uid() { return Math.random().toString(36).slice(2, 10); }

function evalFormula(formula: string, x: number): number | null {
  try {
    const expr = formula.trim()
      .replace(/\^/g, "**")
      .replace(/\bsin\b/g, "Math.sin").replace(/\bcos\b/g, "Math.cos")
      .replace(/\btan\b/g, "Math.tan").replace(/\bsqrt\b/g, "Math.sqrt")
      .replace(/\babs\b/g, "Math.abs").replace(/\bln\b/g, "Math.log")
      .replace(/\blog\b/g, "Math.log10").replace(/\bexp\b/g, "Math.exp")
      .replace(/\bPI\b/g, "Math.PI").replace(/\bE\b/g, "Math.E");
    // eslint-disable-next-line no-new-func
    const y = new Function("x", `"use strict"; return +(${expr})`)(x);
    return Number.isFinite(y) ? y : null;
  } catch { return null; }
}

/* ═══════ Canvas drawing ═══════ */
function drawRuling(ctx: CanvasRenderingContext2D, cw: number, ch: number, ruling: Ruling, px: number, py: number, z: number) {
  if (ruling === "none") return;
  ctx.save();
  if (ruling === "lines") {
    const sp = 28 * z;
    const oy = ((py % sp) + sp) % sp;
    ctx.strokeStyle = "#4E6813"; ctx.lineWidth = 0.9; ctx.globalAlpha = 0.22;
    for (let y = oy; y < ch; y += sp) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke(); }
    const mx = ((120 * z) + px);
    ctx.strokeStyle = "#74070E"; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.28;
    ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, ch); ctx.stroke();
  }
  if (ruling === "calligraphy") {
    const u = 16 * z; const sh = u * 5;
    const offs = [0, u, u * 2, u * 3.5];
    const oy = ((py % sh) + sh) % sh;
    for (let base = oy - sh; base < ch; base += sh) {
      offs.forEach((off, i) => {
        ctx.strokeStyle = i === 0 ? "#74070E" : "#4E6813";
        ctx.lineWidth = i === 0 ? 1.3 : 0.7; ctx.globalAlpha = i === 0 ? 0.3 : 0.18;
        ctx.beginPath(); ctx.moveTo(0, base + off); ctx.lineTo(cw, base + off); ctx.stroke();
      });
    }
  }
  if (ruling === "grid") {
    const sp = 28 * z;
    const ox = ((px % sp) + sp) % sp; const oy = ((py % sp) + sp) % sp;
    ctx.strokeStyle = "#4E6813"; ctx.lineWidth = 0.7; ctx.globalAlpha = 0.18;
    for (let x = ox; x < cw; x += sp) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke(); }
    for (let y = oy; y < ch; y += sp) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke(); }
  }
  ctx.restore();
}

function renderFn(ctx: CanvasRenderingContext2D, item: FunctionItem, px: number, py: number, z: number, sel: boolean) {
  const sx = item.x * z + px, sy = item.y * z + py, sw = item.w * z, sh = item.h * z;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.12)"; ctx.shadowBlur = 10;
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, 10); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = sel ? "#74070E" : "#e0d4c0"; ctx.lineWidth = sel ? 2.5 : 1.5;
  if (sel) ctx.setLineDash([6, 3]);
  ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, 10); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, 10); ctx.clip();

  const mX = (v: number) => sx + (v - item.xMin) / (item.xMax - item.xMin) * sw;
  const mY = (v: number) => sy + (1 - (v - item.yMin) / (item.yMax - item.yMin)) * sh;
  const axX = Math.max(sx, Math.min(sx + sw, mX(0)));
  const axY = Math.max(sy, Math.min(sy + sh, mY(0)));

  ctx.strokeStyle = "#e8e8e8"; ctx.lineWidth = 0.7;
  for (let gx = Math.ceil(item.xMin); gx <= Math.floor(item.xMax); gx++) {
    if (!gx) continue;
    ctx.beginPath(); ctx.moveTo(mX(gx), sy); ctx.lineTo(mX(gx), sy + sh); ctx.stroke();
  }
  for (let gy = Math.ceil(item.yMin); gy <= Math.floor(item.yMax); gy++) {
    if (!gy) continue;
    ctx.beginPath(); ctx.moveTo(sx, mY(gy)); ctx.lineTo(sx + sw, mY(gy)); ctx.stroke();
  }

  ctx.strokeStyle = "#444"; ctx.lineWidth = 1.8; ctx.fillStyle = "#444";
  ctx.beginPath(); ctx.moveTo(sx + 2, axY); ctx.lineTo(sx + sw - 8, axY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx + sw - 2, axY); ctx.lineTo(sx + sw - 10, axY - 5); ctx.lineTo(sx + sw - 10, axY + 5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(axX, sy + sh - 2); ctx.lineTo(axX, sy + 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(axX, sy + 2); ctx.lineTo(axX - 5, sy + 10); ctx.lineTo(axX + 5, sy + 10); ctx.closePath(); ctx.fill();
  const fs = Math.max(10, 12 * z);
  ctx.font = `bold ${fs}px sans-serif`; ctx.textAlign = "left";
  ctx.fillText("x", sx + sw - 18, axY - 6); ctx.fillText("y", axX + 6, sy + 18);

  const tfs = Math.max(8, 10 * z); ctx.font = `${tfs}px sans-serif`; ctx.fillStyle = "#666"; ctx.strokeStyle = "#aaa"; ctx.lineWidth = 1;
  for (let gx = Math.ceil(item.xMin); gx <= Math.floor(item.xMax); gx++) {
    if (!gx) continue;
    ctx.beginPath(); ctx.moveTo(mX(gx), axY - 4); ctx.lineTo(mX(gx), axY + 4); ctx.stroke();
    ctx.textAlign = "center"; ctx.fillText(String(gx), mX(gx), axY + tfs + 3);
  }
  for (let gy = Math.ceil(item.yMin); gy <= Math.floor(item.yMax); gy++) {
    if (!gy) continue;
    ctx.beginPath(); ctx.moveTo(axX - 4, mY(gy)); ctx.lineTo(axX + 4, mY(gy)); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillText(String(gy), axX - 6, mY(gy) + tfs * 0.35);
  }

  ctx.strokeStyle = item.color; ctx.lineWidth = (item.lineWidth || 2) * Math.max(0.6, z * 0.9);
  ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.beginPath();
  let pen = false;
  for (let i = 0; i <= 300; i++) {
    const wx = item.xMin + i * (item.xMax - item.xMin) / 300;
    const wy = evalFormula(item.formula, wx);
    if (wy === null) { pen = false; continue; }
    if (!pen) { ctx.moveTo(mX(wx), mY(wy)); pen = true; } else ctx.lineTo(mX(wx), mY(wy));
  }
  ctx.stroke();

  const lfs = Math.max(11, 13 * z); ctx.font = `bold ${lfs}px Georgia,serif`;
  const label = `f(x) = ${item.formula}`;
  const lw = ctx.measureText(label).width + 14; const lh = lfs + 8;
  ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.beginPath(); ctx.roundRect(sx + 8, sy + sh - lh - 6, lw, lh, 4); ctx.fill();
  ctx.fillStyle = item.color; ctx.textAlign = "left"; ctx.fillText(label, sx + 15, sy + sh - 12);
  ctx.restore();
}

function renderStroke(ctx: CanvasRenderingContext2D, pts: Pt[], color: string, size: number, px: number, py: number, z: number) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = size * Math.max(0.5, z); ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(pts[0].x * z + px, pts[0].y * z + py);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x * z + px, pts[i].y * z + py);
  ctx.stroke(); ctx.restore();
}

/* ═══════ Component ═══════ */
const COLORS = ["#1c0a0b", "#74070E", "#4E6813", "#1a4080", "#b06010", "#6a1878"];
const SIZES = [{ l: "S", v: 1.5 }, { l: "M", v: 3 }, { l: "L", v: 6 }];
const RULINGS: { id: Ruling; label: string }[] = [
  { id: "none", label: "Без разлиновки" }, { id: "lines", label: "Строки" },
  { id: "calligraphy", label: "Каллиграфия" }, { id: "grid", label: "Клетка" },
];

export default function WhiteboardCanvas({ studentId = "default" }: { studentId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const STORAGE_KEY = `wordbox-board-${studentId}`;

  const [tool, setTool] = useState<Tool>("select");
  const [ruling, setRuling] = useState<Ruling>("none");
  const [color, setColor] = useState("#1c0a0b");
  const [size, setSize] = useState(2);
  const [showFx, setShowFx] = useState(false);
  const [fxFormula, setFxFormula] = useState("x^2");
  const [fxColor, setFxColor] = useState("#74070E");
  const [, setVer] = useState(0);
  const bump = () => setVer(v => v + 1);

  const panX = useRef(0), panY = useRef(0), zoom = useRef(1), dpr = useRef(1);
  const strokes = useRef<Stroke[]>([]);
  const items = useRef<Item[]>([]);
  const history = useRef<BoardState[]>([]);
  const curPts = useRef<Pt[]>([]);
  const selId = useRef<string | null>(null);
  const isPen = useRef(false), isPan = useRef(false), isDrag = useRef(false);
  const lastPt = useRef({ x: 0, y: 0 }), dragOff = useRef({ dx: 0, dy: 0 });
  const toolRef = useRef<Tool>("select"), colorRef = useRef("#1c0a0b");
  const sizeRef = useRef(2), rulingRef = useRef<Ruling>("none");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const d = dpr.current, cw = canvas.width / d, ch = canvas.height / d;
    const px = panX.current, py = panY.current, z = zoom.current;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.fillStyle = "#F0E7DA"; ctx.fillRect(0, 0, cw, ch);
    drawRuling(ctx, cw, ch, rulingRef.current, px, py, z);
    for (const it of items.current) renderFn(ctx, it, px, py, z, it.id === selId.current);
    for (const s of strokes.current) renderStroke(ctx, s.pts, s.color, s.size, px, py, z);
    if (curPts.current.length > 1) renderStroke(ctx, curPts.current, colorRef.current, sizeRef.current, px, py, z);
  }, []);

  /* ── Setup ── */
  useEffect(() => {
    const canvas = canvasRef.current!;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Partial<BoardState>;
      strokes.current = saved.strokes || []; items.current = saved.items || [];
    } catch { /* empty */ }
    const resize = () => {
      dpr.current = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr.current;
      canvas.height = canvas.offsetHeight * dpr.current;
      draw();
    };
    const ro = new ResizeObserver(resize); ro.observe(canvas); resize();
    return () => ro.disconnect();
  }, [draw, STORAGE_KEY]);

  /* ── Autosave ── */
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ strokes: strokes.current, items: items.current })); }
      catch { /* quota */ }
    }, 1000);
  });

  /* ── Pointer events ── */
  useEffect(() => {
    const canvas = canvasRef.current!;
    const sp = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); return { sx: e.clientX - r.left, sy: e.clientY - r.top }; };
    const tw = (sx: number, sy: number) => ({ wx: (sx - panX.current) / zoom.current, wy: (sy - panY.current) / zoom.current });
    const hit = (wx: number, wy: number) => {
      for (let i = items.current.length - 1; i >= 0; i--) {
        const it = items.current[i];
        if (wx >= it.x && wx <= it.x + it.w && wy >= it.y && wy <= it.y + it.h) return it.id;
      }
      return null;
    };
    const pushHist = () => {
      history.current.push({ strokes: strokes.current.map(s => ({ ...s, pts: [...s.pts] })), items: items.current.map(it => ({ ...it })) });
      if (history.current.length > 30) history.current.shift();
    };

    function onDown(e: PointerEvent) {
      canvas.setPointerCapture(e.pointerId);
      const { sx, sy } = sp(e); const { wx, wy } = tw(sx, sy);
      if (toolRef.current === "select") {
        const h = hit(wx, wy);
        if (h) { selId.current = h; isDrag.current = true; const it = items.current.find(i => i.id === h)!; dragOff.current = { dx: it.x - wx, dy: it.y - wy }; }
        else { selId.current = null; isPan.current = true; lastPt.current = { x: sx, y: sy }; }
        draw(); return;
      }
      if (toolRef.current === "pen") { pushHist(); isPen.current = true; curPts.current = [{ x: wx, y: wy }]; return; }
      if (toolRef.current === "eraser") {
        const r = 20 / zoom.current;
        strokes.current = strokes.current.filter(s => !s.pts.some(p => Math.hypot(p.x - wx, p.y - wy) < r));
        draw();
      }
    }
    function onMove(e: PointerEvent) {
      const { sx, sy } = sp(e); const { wx, wy } = tw(sx, sy);
      if (isPan.current) { panX.current += sx - lastPt.current.x; panY.current += sy - lastPt.current.y; lastPt.current = { x: sx, y: sy }; draw(); return; }
      if (isDrag.current && selId.current) {
        const id = selId.current;
        items.current = items.current.map(it => it.id !== id ? it : { ...it, x: wx + dragOff.current.dx, y: wy + dragOff.current.dy });
        draw(); return;
      }
      if (isPen.current) { curPts.current = [...curPts.current, { x: wx, y: wy }]; draw(); return; }
      if (toolRef.current === "eraser" && e.buttons > 0) {
        const r = 20 / zoom.current; const prev = strokes.current.length;
        strokes.current = strokes.current.filter(s => !s.pts.some(p => Math.hypot(p.x - wx, p.y - wy) < r));
        if (strokes.current.length !== prev) draw();
      }
    }
    function onUp() {
      if (isPen.current && curPts.current.length > 1) {
        strokes.current = [...strokes.current, { id: uid(), pts: curPts.current, color: colorRef.current, size: sizeRef.current }];
        curPts.current = []; draw();
      }
      isPen.current = false; isPan.current = false; isDrag.current = false;
    }
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const sx = e.clientX - r.left, sy = e.clientY - r.top;
      const delta = e.deltaY > 0 ? 0.88 : 1.12;
      const nz = Math.max(0.1, Math.min(6, zoom.current * delta));
      panX.current = sx - (sx - panX.current) * (nz / zoom.current);
      panY.current = sy - (sy - panY.current) * (nz / zoom.current);
      zoom.current = nz; draw();
    }
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [draw]);

  /* ── Actions ── */
  function undo() {
    const prev = history.current.pop(); if (!prev) return;
    strokes.current = prev.strokes; items.current = prev.items; draw(); bump();
  }
  function addFn() {
    const t = fxFormula.trim(); if (!t) return;
    const canvas = canvasRef.current!;
    const cw = canvas.offsetWidth, ch = canvas.offsetHeight, z = zoom.current;
    const W = Math.round(cw * 0.45 / z), H = W;
    const cx = (cw / 2 - panX.current) / z, cy = (ch / 2 - panY.current) / z;
    items.current = [...items.current, { type: "function", id: uid(), formula: t, color: fxColor, lineWidth: 2.5, x: cx - W / 2, y: cy - H / 2, w: W, h: H, xMin: -5, xMax: 5, yMin: -5, yMax: 5 }];
    draw(); bump(); setShowFx(false);
  }
  function delSelected() {
    if (!selId.current) return;
    items.current = items.current.filter(it => it.id !== selId.current); selId.current = null; draw(); bump();
  }
  function clearBoard() {
    if (!confirm("Очистить доску?")) return;
    history.current.push({ strokes: strokes.current, items: items.current });
    strokes.current = []; items.current = []; selId.current = null; curPts.current = []; draw(); bump();
  }

  function setToolSync(t: Tool) { toolRef.current = t; setTool(t); }
  function setRulingSync(r: Ruling) { rulingRef.current = r; setRuling(r); draw(); }
  function setColorSync(c: string) { colorRef.current = c; setColor(c); }
  function setSizeSync(s: number) { sizeRef.current = s; setSize(s); }

  return (
    <div className="flex flex-col rounded-3xl overflow-hidden border" style={{ height: "clamp(500px, 78vh, 920px)", borderColor: "var(--brown-pale)" }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.95)", borderColor: "var(--brown-pale)" }}>

        {/* Tools */}
        {(["select", "pen", "eraser"] as Tool[]).map(t => (
          <button key={t} onClick={() => setToolSync(t)}
            className="w-8 h-8 rounded-lg text-sm font-bold transition-all"
            title={t === "select" ? "Выбор" : t === "pen" ? "Карандаш" : "Ластик"}
            style={tool === t ? { background: "var(--brown-mid)", color: "#fff" } : { background: "var(--brown-pale)", color: "var(--brown-dark)" }}>
            {t === "select" ? "↖" : t === "pen" ? "✏" : "⌫"}
          </button>
        ))}

        <div className="w-px h-6 shrink-0" style={{ background: "var(--brown-pale)" }} />

        {/* Colors */}
        {COLORS.map(c => (
          <button key={c} onClick={() => setColorSync(c)}
            className="w-6 h-6 rounded-full border-2 transition-all"
            style={{ background: c, borderColor: color === c ? "#1c0a0b" : "transparent", transform: color === c ? "scale(1.25)" : "scale(1)" }} />
        ))}

        <div className="w-px h-6 shrink-0" style={{ background: "var(--brown-pale)" }} />

        {/* Sizes */}
        {SIZES.map(({ l, v }) => (
          <button key={v} onClick={() => setSizeSync(v)}
            className="px-2 h-7 rounded-lg text-xs font-bold transition-all"
            style={size === v ? { background: "var(--brown-mid)", color: "#fff" } : { background: "var(--brown-pale)", color: "var(--brown-dark)" }}>
            {l}
          </button>
        ))}

        <div className="w-px h-6 shrink-0" style={{ background: "var(--brown-pale)" }} />

        {/* Ruling */}
        <select value={ruling} onChange={e => setRulingSync(e.target.value as Ruling)}
          className="h-7 rounded-lg px-2 text-xs font-semibold focus:outline-none"
          style={{ background: "var(--brown-pale)", color: "var(--brown-dark)", border: "none" }}>
          {RULINGS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>

        <div className="w-px h-6 shrink-0" style={{ background: "var(--brown-pale)" }} />

        {/* f(x) */}
        <div className="relative">
          <button onClick={() => setShowFx(p => !p)}
            className="px-3 h-7 rounded-lg text-xs font-bold transition-all"
            style={showFx ? { background: "var(--brown-mid)", color: "#fff" } : { background: "var(--brown-pale)", color: "var(--brown-dark)" }}>
            f(x)
          </button>
          {showFx && (
            <div className="absolute top-9 left-0 z-20 rounded-2xl border p-4 flex flex-col gap-3 shadow-lg"
              style={{ background: "white", borderColor: "var(--brown-pale)", width: 272 }}>
              <p className="text-xs font-bold" style={{ color: "var(--brown-mid)" }}>График функции</p>
              <input value={fxFormula} onChange={e => setFxFormula(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addFn()}
                placeholder="x^2, sin(x), x*cos(x)..."
                className="rounded-xl px-3 py-2 text-sm focus:outline-none font-mono"
                style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)" }}
                autoFocus />
              <div className="flex gap-2 items-center">
                <span className="text-xs" style={{ color: "var(--brown-light)" }}>Цвет:</span>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setFxColor(c)}
                    className="w-5 h-5 rounded-full border-2"
                    style={{ background: c, borderColor: fxColor === c ? "#000" : "transparent" }} />
                ))}
              </div>
              <button onClick={addFn} className="w-full rounded-xl py-2 text-sm font-semibold text-white"
                style={{ background: "var(--gradient-primary)" }}>
                Добавить
              </button>
            </div>
          )}
        </div>

        <div className="flex-1" />

        <button onClick={undo} title="Отменить" className="w-8 h-7 rounded-lg text-sm font-bold"
          style={{ background: "var(--brown-pale)", color: "var(--brown-dark)" }}>↩</button>
        <button onClick={delSelected} title="Удалить выбранное" className="w-8 h-7 rounded-lg text-sm"
          style={{ background: "var(--brown-pale)", color: "#c04040" }}>🗑</button>
        <button onClick={clearBoard} className="px-3 h-7 rounded-lg text-xs font-bold"
          style={{ background: "var(--brown-pale)", color: "var(--brown-dark)" }}>Очистить</button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"
          style={{ cursor: tool === "select" ? "default" : tool === "pen" ? "crosshair" : "cell", touchAction: "none" }} />
        {showFx && <div className="absolute inset-0" style={{ zIndex: 10 }} onClick={() => setShowFx(false)} />}
      </div>
    </div>
  );
}
