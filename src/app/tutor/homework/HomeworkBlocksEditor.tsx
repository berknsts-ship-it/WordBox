"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, CheckCircle2, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { createInteractiveHomework, type HomeworkBlockType, type AutoQuestionType } from "@/app/actions/homework-blocks";

type Item = {
  _id: string;
  image_url: string | null;
  question: string;
  options: string[] | null;
  correct_answer: string;
  points: number;
};
type Block = { _id: string; type: HomeworkBlockType; instruction: string; words: string[]; autoType: AutoQuestionType; items: Item[] };

const BLOCK_LABELS: Record<HomeworkBlockType, string> = {
  instruction:   "📋 Инструкция",
  word_bank:     "🔤 Банк слов",
  image_answer:  "🖼 Картинка + ответ",
  auto_question: "✅ Вопрос с автопроверкой",
  free_question: "✏️ Свободный вопрос",
};

const AUTO_TYPE_LABELS: Record<AutoQuestionType, string> = {
  bracket: "Раскрыть скобки",
  mcq: "Выбор варианта",
  true_false: "Верно / неверно",
  gap_fill: "Пропуск",
  word_order: "Порядок слов",
};

function uid() {
  return Math.random().toString(36).slice(2);
}

function emptyItem(): Item {
  return { _id: uid(), image_url: null, question: "", options: null, correct_answer: "", points: 1 };
}

function emptyBlock(type: HomeworkBlockType = "instruction"): Block {
  return {
    _id: uid(), type, instruction: "", words: [], autoType: "gap_fill",
    items: type === "image_answer" || type === "auto_question" || type === "free_question" ? [emptyItem()] : [],
  };
}

const inputStyle = { borderColor: "var(--brown-pale)", background: "#fdf8f0", color: "var(--brown-dark)" };
const card = { background: "white", borderColor: "var(--brown-pale)" };

function AnswerKeyBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 p-3 space-y-2" style={{ borderColor: "#8fbf8f", background: "#f2faf2" }}>
      <p className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5" style={{ color: "#2a7a3a" }}>
        <CheckCircle2 size={13} /> Правильный ответ — по нему проверяется работа
      </p>
      {children}
    </div>
  );
}

function ManualBadge() {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: "#fff3cc", color: "#8a6200" }}>
      проверяет репетитор
    </span>
  );
}
function AutoBadge() {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: "#d8f5e0", color: "#1a7a3a" }}>
      автопроверка
    </span>
  );
}

// ── картинка с загрузкой ──────────────────────────────────────────────────────
function ImageUploadItem({
  item, index, canMoveUp, canMoveDown, onChange, onDelete, onMoveUp, onMoveDown,
}: {
  item: Item; index: number; canMoveUp: boolean; canMoveDown: boolean;
  onChange: (item: Item) => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const res = await fetch("/api/homework/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ext }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "Ошибка загрузки");
        return;
      }
      const { signedUrl, publicUrl, contentType } = await res.json();
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`${xhr.status}`)));
        xhr.onerror = () => reject(new Error("Ошибка сети"));
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.send(file);
      });
      onChange({ ...item, image_url: publicUrl });
    } catch {
      setError("Не удалось загрузить картинку");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: "var(--brown-pale)", background: "#fefcf8" }}>
      <div className="flex items-center gap-2">
        <span className="cursor-grab shrink-0 opacity-40" title="Порядок меняется стрелками">
          <GripVertical size={14} />
        </span>
        <div className="flex flex-col shrink-0 -my-1">
          <button type="button" onClick={onMoveUp} disabled={!canMoveUp} className="disabled:opacity-25 hover:opacity-70" style={{ color: "var(--brown-mid)" }}>
            <ChevronUp size={11} />
          </button>
          <button type="button" onClick={onMoveDown} disabled={!canMoveDown} className="disabled:opacity-25 hover:opacity-70" style={{ color: "var(--brown-mid)" }}>
            <ChevronDown size={11} />
          </button>
        </div>
        <span className="text-xs font-bold shrink-0" style={{ color: "var(--brown-mid)" }}>{index + 1}.</span>
        <div className="flex-1" />
        <button type="button" onClick={onDelete} className="p-1 rounded hover:opacity-70" style={{ color: "#dc2626" }}>
          <Trash2 size={13} />
        </button>
      </div>

      {item.image_url ? (
        <div className="relative w-32 h-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image_url} alt="" className="w-full h-full object-cover rounded-lg border" style={{ borderColor: "var(--brown-pale)" }} />
          <button type="button" onClick={() => onChange({ ...item, image_url: null })}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white"
            style={{ background: "#dc2626" }}>
            <X size={11} />
          </button>
        </div>
      ) : (
        <label className="w-32 h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer gap-1"
          style={{ borderColor: "var(--brown-pale)", color: "var(--brown-light)" }}>
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
          <span className="text-[10px]">{uploading ? "Гружу…" : "Загрузить фото"}</span>
          <input type="file" accept="image/*" className="hidden" disabled={uploading}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </label>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <input
        value={item.question} onChange={e => onChange({ ...item, question: e.target.value })}
        placeholder="Подпись под картинкой (необязательно, например: 1.)"
        className="w-full px-3 py-1.5 rounded-lg border outline-none text-xs" style={inputStyle}
      />
    </div>
  );
}

// ── один пункт автовопроса (те же 5 типов, что в грамматике) ─────────────────
function AutoQuestionItem({
  item, autoType, index, canMoveUp, canMoveDown, onChange, onDelete, onMoveUp, onMoveDown,
}: {
  item: Item; autoType: AutoQuestionType; index: number; canMoveUp: boolean; canMoveDown: boolean;
  onChange: (item: Item) => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  const set = (patch: Partial<Item>) => onChange({ ...item, ...patch });

  return (
    <div className="rounded-lg border p-3 space-y-2.5" style={{ borderColor: "var(--brown-pale)", background: "#fefcf8" }}>
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="shrink-0 opacity-40" />
        <div className="flex flex-col shrink-0 -my-1">
          <button type="button" onClick={onMoveUp} disabled={!canMoveUp} className="disabled:opacity-25 hover:opacity-70" style={{ color: "var(--brown-mid)" }}>
            <ChevronUp size={11} />
          </button>
          <button type="button" onClick={onMoveDown} disabled={!canMoveDown} className="disabled:opacity-25 hover:opacity-70" style={{ color: "var(--brown-mid)" }}>
            <ChevronDown size={11} />
          </button>
        </div>
        <span className="text-xs font-bold shrink-0" style={{ color: "var(--brown-mid)" }}>{index + 1}.</span>
        <div className="flex-1" />
        <input
          type="number" min="1" value={item.points}
          onChange={e => set({ points: parseInt(e.target.value) || 1 })}
          className="w-12 px-1.5 py-1 rounded-lg border outline-none text-xs text-center" style={inputStyle} title="Баллы"
        />
        <button type="button" onClick={onDelete} className="p-1 rounded hover:opacity-70" style={{ color: "#dc2626" }}>
          <Trash2 size={13} />
        </button>
      </div>

      {(autoType === "bracket" || autoType === "gap_fill") && (
        <>
          <input value={item.question} onChange={e => set({ question: e.target.value })}
            placeholder={autoType === "bracket" ? "I ___ (go) to school yesterday" : "There ___ a book on the table."}
            className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm" style={inputStyle} />
          <AnswerKeyBox>
            <input value={item.correct_answer} onChange={e => set({ correct_answer: e.target.value })}
              placeholder="Ответ (или несколько вариантов через |)"
              className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm bg-white" style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }} />
          </AnswerKeyBox>
        </>
      )}

      {autoType === "true_false" && (
        <>
          <input value={item.question} onChange={e => set({ question: e.target.value })}
            placeholder="'I have been to Paris' uses the Present Perfect."
            className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm" style={inputStyle} />
          <AnswerKeyBox>
            <div className="flex gap-2">
              {(["true", "false"] as const).map(v => (
                <button key={v} type="button" onClick={() => set({ correct_answer: v })}
                  className="flex-1 py-1.5 rounded-lg border-2 text-sm font-semibold flex items-center justify-center gap-1.5"
                  style={item.correct_answer === v
                    ? { borderColor: "#2a7a3a", background: "#e6f7e6", color: "#2a7a3a" }
                    : { borderColor: "var(--brown-pale)", background: "white", color: "var(--brown-mid)" }}>
                  {item.correct_answer === v && <CheckCircle2 size={13} />}
                  {v === "true" ? "Верно" : "Неверно"}
                </button>
              ))}
            </div>
          </AnswerKeyBox>
        </>
      )}

      {autoType === "mcq" && (
        <>
          <input value={item.question} onChange={e => set({ question: e.target.value })}
            placeholder="Choose the correct form: She ___ to work every day."
            className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm" style={inputStyle} />
          <AnswerKeyBox>
            <div className="space-y-1.5">
              {["A", "B", "C", "D"].map((letter, i) => {
                const opts = item.options ?? ["", "", "", ""];
                const selected = item.correct_answer === letter;
                return (
                  <div key={letter} onClick={() => set({ correct_answer: letter })}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border-2 cursor-pointer"
                    style={selected ? { borderColor: "#2a7a3a", background: "#e6f7e6" } : { borderColor: "var(--brown-pale)", background: "white" }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={selected ? { background: "#2a7a3a", color: "white" } : { background: "var(--brown-pale)", color: "var(--brown-mid)" }}>
                      {selected ? <CheckCircle2 size={12} /> : letter}
                    </span>
                    <input value={opts[i]}
                      onChange={e => { const next = [...opts]; next[i] = e.target.value; set({ options: next }); }}
                      onClick={e => e.stopPropagation()}
                      placeholder={`Вариант ${letter}`}
                      className="flex-1 px-2 py-1 rounded-md border outline-none text-sm bg-white" style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }} />
                  </div>
                );
              })}
            </div>
          </AnswerKeyBox>
        </>
      )}

      {autoType === "word_order" && (
        <AnswerKeyBox>
          <input value={item.correct_answer}
            onChange={e => set({ correct_answer: e.target.value, question: e.target.value })}
            placeholder="She has never been to London (или несколько вариантов через |)"
            className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm bg-white" style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }} />
          <p className="text-xs" style={{ color: "#2a7a3a" }}>Слова перемешаются автоматически при показе ученику</p>
        </AnswerKeyBox>
      )}
    </div>
  );
}

// ── блок ───────────────────────────────────────────────────────────────────
function BlockCard({
  block, index, canMoveUp, canMoveDown, onChange, onDelete, onMoveUp, onMoveDown,
  dragging, onDragStart, onDragOver, onDrop, onDragEnd,
}: {
  block: Block; index: number; canMoveUp: boolean; canMoveDown: boolean;
  onChange: (b: Block) => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void;
  dragging: boolean; onDragStart: () => void; onDragOver: (e: React.DragEvent) => void; onDrop: () => void; onDragEnd: () => void;
}) {
  const changeType = (type: HomeworkBlockType) => onChange({ ...emptyBlock(type), _id: block._id });
  const addItem = () => onChange({ ...block, items: [...block.items, emptyItem()] });
  const updateItem = (id: string, next: Item) => onChange({ ...block, items: block.items.map(it => (it._id === id ? next : it)) });
  const deleteItem = (id: string) => onChange({ ...block, items: block.items.filter(it => it._id !== id) });
  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= block.items.length || from === to) return;
    const next = [...block.items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange({ ...block, items: next });
  };

  const [wordInput, setWordInput] = useState("");
  const addWord = () => {
    const w = wordInput.trim();
    if (!w) return;
    onChange({ ...block, words: [...block.words, w] });
    setWordInput("");
  };

  return (
    <div onDragOver={onDragOver} onDrop={onDrop} className="rounded-xl border-2 p-3.5 space-y-3" style={{ ...card, opacity: dragging ? 0.4 : 1 }}>
      <div className="flex items-center gap-2 flex-wrap">
        <span draggable onDragStart={onDragStart} onDragEnd={onDragEnd} className="cursor-grab active:cursor-grabbing shrink-0" style={{ color: "var(--brown-light)" }}>
          <GripVertical size={16} />
        </span>
        <div className="flex flex-col shrink-0 -my-1">
          <button type="button" onClick={onMoveUp} disabled={!canMoveUp} className="disabled:opacity-25 hover:opacity-70" style={{ color: "var(--brown-mid)" }}>
            <ChevronUp size={13} />
          </button>
          <button type="button" onClick={onMoveDown} disabled={!canMoveDown} className="disabled:opacity-25 hover:opacity-70" style={{ color: "var(--brown-mid)" }}>
            <ChevronDown size={13} />
          </button>
        </div>
        <span className="text-sm font-bold shrink-0" style={{ color: "var(--brown-mid)" }}>Блок {index + 1}</span>
        <select value={block.type} onChange={e => changeType(e.target.value as HomeworkBlockType)}
          className="text-xs px-2 py-1 rounded-lg border outline-none" style={inputStyle}>
          {(Object.keys(BLOCK_LABELS) as HomeworkBlockType[]).map(t => (
            <option key={t} value={t}>{BLOCK_LABELS[t]}</option>
          ))}
        </select>
        {(block.type === "image_answer" || block.type === "free_question") && <ManualBadge />}
        {block.type === "auto_question" && <AutoBadge />}
        <div className="flex-1" />
        <button type="button" onClick={onDelete} className="p-1 rounded hover:opacity-70" style={{ color: "#dc2626" }}>
          <Trash2 size={14} />
        </button>
      </div>

      {block.type === "instruction" && (
        <textarea value={block.instruction} onChange={e => onChange({ ...block, instruction: e.target.value })}
          rows={2} placeholder="Например: Look at the photos. Write one sentence about each."
          className="w-full px-3 py-2 rounded-xl border outline-none text-sm resize-none" style={inputStyle} />
      )}

      {block.type === "word_bank" && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {block.words.map((w, i) => (
              <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: "#f5ece3", color: "var(--brown-dark)" }}>
                {w}
                <button type="button" onClick={() => onChange({ ...block, words: block.words.filter((_, j) => j !== i) })} className="hover:opacity-60">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={wordInput} onChange={e => setWordInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addWord(); } }}
              placeholder="get up, draw, play… (Enter — добавить)"
              className="flex-1 px-3 py-1.5 rounded-lg border outline-none text-sm" style={inputStyle} />
            <button type="button" onClick={addWord} className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-80"
              style={{ background: "var(--brown-pale)", color: "var(--brown-dark)" }}>
              Добавить
            </button>
          </div>
        </div>
      )}

      {block.type === "image_answer" && (
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: "var(--brown-light)" }}>Подпись над блоком (необязательно)</label>
          <input value={block.instruction} onChange={e => onChange({ ...block, instruction: e.target.value })}
            placeholder="Например: Look at the photos and write sentences"
            className="w-full px-3 py-2 rounded-xl border outline-none text-sm mb-3" style={inputStyle} />
          <div className="grid grid-cols-2 gap-2 pl-2">
            {block.items.map((item, i) => (
              <ImageUploadItem key={item._id} item={item} index={i}
                canMoveUp={i > 0} canMoveDown={i < block.items.length - 1}
                onChange={next => updateItem(item._id, next)} onDelete={() => deleteItem(item._id)}
                onMoveUp={() => moveItem(i, i - 1)} onMoveDown={() => moveItem(i, i + 1)} />
            ))}
          </div>
          <button type="button" onClick={addItem}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border w-full justify-center text-xs font-medium hover:opacity-80"
            style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)", borderStyle: "dashed" }}>
            <Plus size={12} /> Добавить фото
          </button>
        </div>
      )}

      {block.type === "auto_question" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-xs shrink-0" style={{ color: "var(--brown-light)" }}>Тип:</label>
            <select value={block.autoType} onChange={e => onChange({ ...block, autoType: e.target.value as AutoQuestionType })}
              className="text-xs px-2 py-1 rounded-lg border outline-none" style={inputStyle}>
              {(Object.keys(AUTO_TYPE_LABELS) as AutoQuestionType[]).map(t => (
                <option key={t} value={t}>{AUTO_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--brown-light)" }}>Инструкция (общая для пунктов ниже)</label>
            <input value={block.instruction} onChange={e => onChange({ ...block, instruction: e.target.value })}
              placeholder="Например: Раскрой скобки, поставь глагол в правильную форму"
              className="w-full px-3 py-2 rounded-xl border outline-none text-sm" style={inputStyle} />
          </div>
          <div className="space-y-2 pl-2">
            {block.items.map((item, i) => (
              <AutoQuestionItem key={item._id} item={item} autoType={block.autoType} index={i}
                canMoveUp={i > 0} canMoveDown={i < block.items.length - 1}
                onChange={next => updateItem(item._id, next)} onDelete={() => deleteItem(item._id)}
                onMoveUp={() => moveItem(i, i - 1)} onMoveDown={() => moveItem(i, i + 1)} />
            ))}
            <button type="button" onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border w-full justify-center text-xs font-medium hover:opacity-80"
              style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)", borderStyle: "dashed" }}>
              <Plus size={12} /> Добавить пункт
            </button>
          </div>
        </div>
      )}

      {block.type === "free_question" && (
        <div className="space-y-2 pl-2">
          {block.items.map((item, i) => (
            <div key={item._id} className="rounded-lg border p-3 space-y-2" style={{ borderColor: "var(--brown-pale)", background: "#fefcf8" }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: "var(--brown-mid)" }}>{i + 1}.</span>
                <div className="flex-1" />
                {block.items.length > 1 && (
                  <button type="button" onClick={() => deleteItem(item._id)} className="p-1 rounded hover:opacity-70" style={{ color: "#dc2626" }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <textarea value={item.question} onChange={e => updateItem(item._id, { ...item, question: e.target.value })}
                rows={2} placeholder="Текст вопроса, на который ученик ответит своими словами"
                className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm resize-none" style={inputStyle} />
            </div>
          ))}
          <button type="button" onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border w-full justify-center text-xs font-medium hover:opacity-80"
            style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)", borderStyle: "dashed" }}>
            <Plus size={12} /> Добавить вопрос
          </button>
        </div>
      )}
    </div>
  );
}

// ── вся домашка ────────────────────────────────────────────────────────────
export default function HomeworkBlocksEditor({ students }: { students: { id: string; name: string }[] }) {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBlock = (type: HomeworkBlockType) => setBlocks(prev => [...prev, emptyBlock(type)]);
  const updateBlock = (id: string, next: Block) => setBlocks(prev => prev.map(b => (b._id === id ? next : b)));
  const deleteBlock = (id: string) => setBlocks(prev => prev.filter(b => b._id !== id));
  const moveBlock = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length || from === to) return;
    setBlocks(prev => {
      const next = [...prev];
      const [b] = next.splice(from, 1);
      next.splice(to, 0, b);
      return next;
    });
  };

  async function handleSave() {
    setError(null);
    if (!studentId) { setError("Выбери ученика"); return; }
    if (!title.trim()) { setError("Введи название задания"); return; }
    if (blocks.length === 0) { setError("Добавь хотя бы один блок"); return; }

    setSaving(true);
    const result = await createInteractiveHomework({
      student_id: studentId,
      title,
      description: description || null,
      due_date: dueDate || null,
      blocks: blocks.map(b => ({
        type: b.type,
        instruction: b.instruction || null,
        words: b.type === "word_bank" ? b.words : null,
        items: b.items.map(it => ({
          image_url: it.image_url,
          question: it.question || null,
          auto_type: b.type === "auto_question" ? b.autoType : null,
          options: it.options,
          correct_answer: it.correct_answer || null,
          points: it.points,
        })),
      })),
    });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    router.push("/tutor/homework");
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="rounded-2xl border p-5 space-y-3" style={card}>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "var(--brown-mid)" }}>Ученик *</label>
          <select value={studentId} onChange={e => setStudentId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border outline-none text-sm" style={inputStyle}>
            <option value="">Выбери ученика</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "var(--brown-mid)" }}>Название *</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Например: Unit 5 — Photos & sentences"
            className="w-full px-3 py-2 rounded-xl border outline-none text-sm" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "var(--brown-mid)" }}>Описание</label>
          <input value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Краткое описание (необязательно)"
            className="w-full px-3 py-2 rounded-xl border outline-none text-sm" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "var(--brown-mid)" }}>Срок сдачи</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border outline-none text-sm" style={inputStyle} />
        </div>
      </div>

      <div className="space-y-3">
        {blocks.map((block, i) => (
          <BlockCard key={block._id} block={block} index={i}
            canMoveUp={i > 0} canMoveDown={i < blocks.length - 1}
            onChange={next => updateBlock(block._id, next)} onDelete={() => deleteBlock(block._id)}
            onMoveUp={() => moveBlock(i, i - 1)} onMoveDown={() => moveBlock(i, i + 1)}
            dragging={dragIdx === i} onDragStart={() => setDragIdx(i)} onDragOver={e => e.preventDefault()}
            onDrop={() => { if (dragIdx !== null) moveBlock(dragIdx, i); setDragIdx(null); }} onDragEnd={() => setDragIdx(null)} />
        ))}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(BLOCK_LABELS) as HomeworkBlockType[]).map(t => (
            <button key={t} type="button" onClick={() => addBlock(t)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border justify-center text-xs font-medium hover:opacity-80"
              style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)", borderStyle: "dashed" }}>
              <Plus size={12} /> {BLOCK_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}>
          {saving ? "Сохраняю…" : "Дать задание"}
        </button>
      </div>
    </div>
  );
}
