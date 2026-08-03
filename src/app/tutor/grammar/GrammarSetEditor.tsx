"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, CheckCircle2, ChevronUp, ChevronDown } from "lucide-react";
import { createGrammarSet, updateGrammarSet, type ItemInput, type ExerciseType } from "@/app/actions/grammar";

type Item = ItemInput & { _id: string };
type ExerciseBlock = { _id: string; type: ExerciseType; instruction: string; items: Item[] };

const TYPE_LABELS: Record<ExerciseType, string> = {
  bracket: "Раскрыть скобки",
  mcq: "Выбор варианта",
  true_false: "Верно / неверно",
  fix_error: "Исправить ошибку",
  gap_fill: "Пропуск",
  word_order: "Порядок слов",
};

function uid() {
  return Math.random().toString(36).slice(2);
}

function emptyItem(type: ExerciseType): Item {
  return {
    _id: uid(),
    question: "",
    correct_answer: "",
    options: type === "mcq" ? ["", "", "", ""] : null,
    points: 1,
    explanation: null,
  };
}

function emptyBlock(): ExerciseBlock {
  return { _id: uid(), type: "bracket", instruction: "", items: [emptyItem("bracket")] };
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

// ── один пункт внутри упражнения ──────────────────────────────────────────────
function ItemRow({
  item, type, index, canMoveUp, canMoveDown, onChange, onDelete, onMoveUp, onMoveDown,
  dragging, onDragStart, onDragOver, onDrop, onDragEnd,
}: {
  item: Item;
  type: ExerciseType;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (item: Item) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  dragging: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const set = (patch: Partial<Item>) => onChange({ ...item, ...patch });

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="rounded-lg border p-3 space-y-2.5"
      style={{ borderColor: "var(--brown-pale)", background: "#fefcf8", opacity: dragging ? 0.4 : 1 }}
    >
      <div className="flex items-center gap-2">
        <span draggable onDragStart={onDragStart} onDragEnd={onDragEnd}
          className="cursor-grab active:cursor-grabbing shrink-0" style={{ color: "var(--brown-light)" }}
          title="Перетащить для изменения порядка">
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
        <input
          type="number" min="1" value={item.points}
          onChange={e => set({ points: parseInt(e.target.value) || 1 })}
          className="w-12 px-1.5 py-1 rounded-lg border outline-none text-xs text-center"
          style={inputStyle} title="Баллы"
        />
        <button type="button" onClick={onDelete} className="p-1 rounded hover:opacity-70" style={{ color: "#dc2626" }}>
          <Trash2 size={13} />
        </button>
      </div>

      {type === "bracket" && (
        <>
          <input
            value={item.question} onChange={e => set({ question: e.target.value })}
            placeholder="I ___ (go) to school yesterday"
            className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm" style={inputStyle}
          />
          <AnswerKeyBox>
            <input
              value={item.correct_answer} onChange={e => set({ correct_answer: e.target.value })}
              placeholder="went (или несколько вариантов через | — напр. went|had gone)"
              className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm bg-white" style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </AnswerKeyBox>
        </>
      )}

      {type === "gap_fill" && (
        <>
          <input
            value={item.question} onChange={e => set({ question: e.target.value })}
            placeholder="There ___ a book on the table."
            className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm" style={inputStyle}
          />
          <AnswerKeyBox>
            <input
              value={item.correct_answer} onChange={e => set({ correct_answer: e.target.value })}
              placeholder="is (или несколько вариантов через |)"
              className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm bg-white" style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </AnswerKeyBox>
        </>
      )}

      {type === "fix_error" && (
        <>
          <input
            value={item.question} onChange={e => set({ question: e.target.value })}
            placeholder="She don't like coffee."
            className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm" style={inputStyle}
          />
          <AnswerKeyBox>
            <input
              value={item.correct_answer} onChange={e => set({ correct_answer: e.target.value })}
              placeholder="She doesn't like coffee. (или несколько вариантов через |)"
              className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm bg-white" style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </AnswerKeyBox>
        </>
      )}

      {type === "true_false" && (
        <>
          <input
            value={item.question} onChange={e => set({ question: e.target.value })}
            placeholder="'I have been to Paris' uses the Present Perfect."
            className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm" style={inputStyle}
          />
          <AnswerKeyBox>
            <div className="flex gap-2">
              {(["true", "false"] as const).map(v => (
                <button
                  key={v} type="button" onClick={() => set({ correct_answer: v })}
                  className="flex-1 py-1.5 rounded-lg border-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all"
                  style={item.correct_answer === v
                    ? { borderColor: "#2a7a3a", background: "#e6f7e6", color: "#2a7a3a" }
                    : { borderColor: "var(--brown-pale)", background: "white", color: "var(--brown-mid)" }}
                >
                  {item.correct_answer === v && <CheckCircle2 size={13} />}
                  {v === "true" ? "Верно" : "Неверно"}
                </button>
              ))}
            </div>
          </AnswerKeyBox>
        </>
      )}

      {type === "mcq" && (
        <>
          <input
            value={item.question} onChange={e => set({ question: e.target.value })}
            placeholder="Choose the correct form: She ___ to work every day."
            className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm" style={inputStyle}
          />
          <AnswerKeyBox>
            <div className="space-y-1.5">
              {["A", "B", "C", "D"].map((letter, i) => {
                const opts = item.options ?? ["", "", "", ""];
                const selected = item.correct_answer === letter;
                return (
                  <div key={letter} onClick={() => set({ correct_answer: letter })}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border-2 cursor-pointer transition-all"
                    style={selected ? { borderColor: "#2a7a3a", background: "#e6f7e6" } : { borderColor: "var(--brown-pale)", background: "white" }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={selected ? { background: "#2a7a3a", color: "white" } : { background: "var(--brown-pale)", color: "var(--brown-mid)" }}>
                      {selected ? <CheckCircle2 size={12} /> : letter}
                    </span>
                    <input
                      value={opts[i]}
                      onChange={e => { const next = [...opts]; next[i] = e.target.value; set({ options: next }); }}
                      onClick={e => e.stopPropagation()}
                      placeholder={`Вариант ${letter}`}
                      className="flex-1 px-2 py-1 rounded-md border outline-none text-sm bg-white"
                      style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}
                    />
                  </div>
                );
              })}
            </div>
          </AnswerKeyBox>
        </>
      )}

      {type === "word_order" && (
        <AnswerKeyBox>
          <input
            value={item.correct_answer}
            onChange={e => set({ correct_answer: e.target.value, question: e.target.value })}
            placeholder="She has never been to London (или несколько вариантов через |)"
            className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm bg-white" style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}
          />
          <p className="text-xs" style={{ color: "#2a7a3a" }}>
            Слова перемешаются автоматически при показе ученику
          </p>
        </AnswerKeyBox>
      )}

      <input
        value={item.explanation ?? ""} onChange={e => set({ explanation: e.target.value || null })}
        placeholder="Разбор для ученика (необязательно)"
        className="w-full px-3 py-1.5 rounded-lg border outline-none text-xs" style={inputStyle}
      />
    </div>
  );
}

// ── упражнение (блок): тип + инструкция + список пунктов ─────────────────────
function ExerciseBlockCard({
  block, index, canMoveUp, canMoveDown, onChange, onDelete, onMoveUp, onMoveDown,
  dragging, onDragStart, onDragOver, onDrop, onDragEnd,
}: {
  block: ExerciseBlock;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (block: ExerciseBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  dragging: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const [dragItemIdx, setDragItemIdx] = useState<number | null>(null);

  const changeType = (type: ExerciseType) => {
    onChange({ ...block, type, items: block.items.map(() => emptyItem(type)) });
  };

  const addItem = () => onChange({ ...block, items: [...block.items, emptyItem(block.type)] });
  const updateItem = (id: string, next: Item) =>
    onChange({ ...block, items: block.items.map(it => (it._id === id ? next : it)) });
  const deleteItem = (id: string) =>
    onChange({ ...block, items: block.items.filter(it => it._id !== id) });
  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= block.items.length || from === to) return;
    const next = [...block.items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange({ ...block, items: next });
  };

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="rounded-xl border-2 p-3.5 space-y-3"
      style={{ ...card, opacity: dragging ? 0.4 : 1 }}
    >
      <div className="flex items-center gap-2">
        <span draggable onDragStart={onDragStart} onDragEnd={onDragEnd}
          className="cursor-grab active:cursor-grabbing shrink-0" style={{ color: "var(--brown-light)" }}
          title="Перетащить для изменения порядка">
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
        <span className="text-sm font-bold shrink-0" style={{ color: "var(--brown-mid)" }}>
          Упражнение {index + 1}
        </span>
        <select
          value={block.type} onChange={e => changeType(e.target.value as ExerciseType)}
          className="text-xs px-2 py-1 rounded-lg border outline-none" style={inputStyle}
        >
          {(Object.keys(TYPE_LABELS) as ExerciseType[]).map(t => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
        <div className="flex-1" />
        <button type="button" onClick={onDelete} className="p-1 rounded hover:opacity-70" style={{ color: "#dc2626" }}>
          <Trash2 size={14} />
        </button>
      </div>

      <div>
        <label className="text-xs mb-1 block" style={{ color: "var(--brown-light)" }}>
          Инструкция (общая для всех пунктов ниже)
        </label>
        <input
          value={block.instruction} onChange={e => onChange({ ...block, instruction: e.target.value })}
          placeholder="Например: Раскрой скобки, поставь глагол в правильную форму"
          className="w-full px-3 py-2 rounded-xl border outline-none text-sm" style={inputStyle}
        />
      </div>

      <div className="space-y-2 pl-2">
        {block.items.map((item, i) => (
          <ItemRow
            key={item._id}
            item={item}
            type={block.type}
            index={i}
            canMoveUp={i > 0}
            canMoveDown={i < block.items.length - 1}
            onChange={next => updateItem(item._id, next)}
            onDelete={() => deleteItem(item._id)}
            onMoveUp={() => moveItem(i, i - 1)}
            onMoveDown={() => moveItem(i, i + 1)}
            dragging={dragItemIdx === i}
            onDragStart={() => setDragItemIdx(i)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => { if (dragItemIdx !== null) moveItem(dragItemIdx, i); setDragItemIdx(null); }}
            onDragEnd={() => setDragItemIdx(null)}
          />
        ))}
        <button
          type="button" onClick={addItem}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border w-full justify-center text-xs font-medium hover:opacity-80 transition-all"
          style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)", borderStyle: "dashed" }}
        >
          <Plus size={12} /> Добавить пункт
        </button>
      </div>
    </div>
  );
}

// ── весь набор ─────────────────────────────────────────────────────────────────
export default function GrammarSetEditor({
  existingSetId,
  initial,
}: {
  existingSetId?: string;
  initial?: { title: string; description: string; exercises: ExerciseBlock[] };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [exercises, setExercises] = useState<ExerciseBlock[]>(initial?.exercises ?? []);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBlock = () => setExercises(prev => [...prev, emptyBlock()]);
  const updateBlock = (id: string, next: ExerciseBlock) =>
    setExercises(prev => prev.map(b => (b._id === id ? next : b)));
  const deleteBlock = (id: string) =>
    setExercises(prev => prev.filter(b => b._id !== id));
  const moveBlock = (from: number, to: number) => {
    if (to < 0 || to >= exercises.length || from === to) return;
    setExercises(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  async function handleSave() {
    setError(null);
    if (!title.trim()) { setError("Введите название набора"); return; }
    if (exercises.length === 0) { setError("Добавьте хотя бы одно упражнение"); return; }
    for (const block of exercises) {
      if (block.items.length === 0) { setError("В каждом упражнении должен быть хотя бы один пункт"); return; }
      for (const item of block.items) {
        if (!item.question.trim()) { setError("У каждого пункта должен быть текст вопроса"); return; }
        if (!item.correct_answer.trim()) { setError("У каждого пункта должен быть правильный ответ"); return; }
      }
    }

    setSaving(true);
    const input = {
      title,
      description: description || null,
      exercises: exercises.map(({ _id, items, ...rest }) => ({
        ...rest,
        instruction: rest.instruction || null,
        items: items.map(({ _id: _itemId, ...itemRest }) => itemRest),
      })),
    };
    const result = existingSetId
      ? await updateGrammarSet(existingSetId, input)
      : await createGrammarSet(input);
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    router.push("/tutor/grammar");
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="rounded-2xl border p-5 space-y-3" style={card}>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "var(--brown-mid)" }}>
            Название набора
          </label>
          <input
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Например: Present Perfect"
            className="w-full px-3 py-2 rounded-xl border outline-none text-sm" style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "var(--brown-mid)" }}>
            Описание (необязательно)
          </label>
          <input
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Краткое описание набора"
            className="w-full px-3 py-2 rounded-xl border outline-none text-sm" style={inputStyle}
          />
        </div>
      </div>

      <div className="space-y-3">
        {exercises.map((block, i) => (
          <ExerciseBlockCard
            key={block._id}
            block={block}
            index={i}
            canMoveUp={i > 0}
            canMoveDown={i < exercises.length - 1}
            onChange={next => updateBlock(block._id, next)}
            onDelete={() => deleteBlock(block._id)}
            onMoveUp={() => moveBlock(i, i - 1)}
            onMoveDown={() => moveBlock(i, i + 1)}
            dragging={dragIdx === i}
            onDragStart={() => setDragIdx(i)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => { if (dragIdx !== null) moveBlock(dragIdx, i); setDragIdx(null); }}
            onDragEnd={() => setDragIdx(null)}
          />
        ))}

        <button
          type="button" onClick={addBlock}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border w-full justify-center text-sm font-medium hover:opacity-80 transition-all"
          style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)", borderStyle: "dashed" }}
        >
          <Plus size={14} /> Добавить упражнение
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button" onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-all"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
        >
          {saving ? "Сохраняю…" : existingSetId ? "Сохранить изменения" : "Создать набор"}
        </button>
      </div>
    </div>
  );
}
