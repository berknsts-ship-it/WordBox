"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Volume2, Plus, Pencil, Trash2, X, Check, LayoutGrid, Rows3 } from "lucide-react";
import { addStudentWord, updateStudentWord, deleteStudentWord } from "@/app/actions/student-vocabulary";

export type VocabWord = {
  id: string;
  english: string;
  russian: string;
  setId: string;
  setName: string;
  status: "queue" | "learning" | "mastered";
  isOwn: boolean;
};

export type VocabSet = { id: string; name: string };

type StatusFilter = "all" | "queue" | "learning" | "mastered";

const STATUS_META: Record<"queue" | "learning" | "mastered", { label: string; color: string }> = {
  queue:    { label: "Новое",   color: "var(--brown-light)" },
  learning: { label: "Учится",  color: "#C9902A" },
  mastered: { label: "Выучено", color: "#4a7a5e" },
};

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-GB";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

const card = { background: "var(--theme-card-bg)", borderColor: "var(--theme-card-border)" };
const input = { background: "var(--theme-bg, #fff)", borderColor: "var(--theme-card-border)", color: "var(--brown-dark)" };

function WordRow({
  word,
  showTopic,
  onEdit,
  onDelete,
  editing,
  editFields,
  onEditFieldsChange,
  onSaveEdit,
  onCancelEdit,
  editPending,
}: {
  word: VocabWord;
  showTopic: boolean;
  onEdit: () => void;
  onDelete: () => void;
  editing: boolean;
  editFields: { english: string; russian: string };
  onEditFieldsChange: (f: { english: string; russian: string }) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  editPending: boolean;
}) {
  const meta = STATUS_META[word.status];

  if (editing) {
    return (
      <div className="rounded-xl border p-3 space-y-2" style={card}>
        <div className="flex gap-2">
          <input
            value={editFields.english}
            onChange={(e) => onEditFieldsChange({ ...editFields, english: e.target.value })}
            className="flex-1 px-3 py-1.5 rounded-lg border outline-none text-sm"
            style={input}
            placeholder="Слово"
            autoFocus
          />
          <input
            value={editFields.russian}
            onChange={(e) => onEditFieldsChange({ ...editFields, russian: e.target.value })}
            className="flex-1 px-3 py-1.5 rounded-lg border outline-none text-sm"
            style={input}
            placeholder="Перевод"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSaveEdit}
            disabled={editPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-80 disabled:opacity-50"
            style={{ background: "var(--theme-accent)" }}
          >
            <Check size={12} /> {editPending ? "…" : "Сохранить"}
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border hover:opacity-80"
            style={{ borderColor: "var(--theme-card-border)", color: "var(--brown-light)" }}
          >
            <X size={12} /> Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-3 flex items-center gap-3" style={card}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-sm" style={{ color: "var(--brown-dark)" }}>{word.english}</span>
          <button
            type="button"
            onClick={() => speak(word.english)}
            className="opacity-50 hover:opacity-90 transition-all"
            style={{ color: "var(--theme-accent)" }}
            aria-label="Озвучить"
          >
            <Volume2 size={13} />
          </button>
          <span className="text-sm" style={{ color: "var(--brown-mid)" }}>— {word.russian}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {showTopic && (
            <span className="text-xs" style={{ color: "var(--brown-light)" }}>{word.setName}</span>
          )}
          <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
          {word.isOwn && (
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
              style={{ background: "var(--theme-accent)", color: "#fff", opacity: 0.85 }}
            >
              Моё
            </span>
          )}
        </div>
      </div>

      {word.isOwn && (
        <div className="flex gap-1 shrink-0">
          <button type="button" onClick={onEdit} className="p-1.5 rounded-lg hover:opacity-70 transition-all" style={{ color: "var(--brown-mid)" }}>
            <Pencil size={14} />
          </button>
          <button type="button" onClick={onDelete} className="p-1.5 rounded-lg hover:opacity-70 transition-all" style={{ color: "#c06040" }}>
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function VocabularyList({
  studentId,
  words: initialWords,
  sets: initialSets,
}: {
  studentId: string;
  words: VocabWord[];
  sets: VocabSet[];
}) {
  const [words, setWords] = useState(initialWords);
  const [sets, setSets] = useState(initialSets);
  const [query, setQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [grouped, setGrouped] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [newFields, setNewFields] = useState({ english: "", russian: "", setId: "" });
  const [addError, setAddError] = useState<string | null>(null);
  const [addPending, startAdd] = useTransition();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ english: "", russian: "" });
  const [editPending, startEdit] = useTransition();
  const [, startDel] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return words.filter((w) => {
      if (topicFilter !== "all" && w.setId !== topicFilter) return false;
      if (statusFilter !== "all" && w.status !== statusFilter) return false;
      if (q && !w.english.toLowerCase().includes(q) && !w.russian.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [words, query, topicFilter, statusFilter]);

  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, VocabWord[]>();
    for (const w of filtered) {
      if (!map.has(w.setId)) { map.set(w.setId, []); order.push(w.setId); }
      map.get(w.setId)!.push(w);
    }
    return order.map((setId) => ({ setId, name: map.get(setId)![0].setName, items: map.get(setId)! }));
  }, [filtered]);

  function startEditing(w: VocabWord) {
    setEditingId(w.id);
    setEditFields({ english: w.english, russian: w.russian });
  }

  function saveEdit() {
    if (!editingId) return;
    startEdit(async () => {
      const res = await updateStudentWord(studentId, editingId, editFields.english, editFields.russian);
      if (!res.error) {
        setWords((ws) =>
          ws.map((w) => (w.id === editingId ? { ...w, english: editFields.english.trim(), russian: editFields.russian.trim() } : w))
        );
        setEditingId(null);
      }
    });
  }

  function handleDelete(wordId: string) {
    startDel(async () => {
      const res = await deleteStudentWord(studentId, wordId);
      if (!res.error) setWords((ws) => ws.filter((w) => w.id !== wordId));
    });
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    if (!newFields.english.trim() || !newFields.russian.trim()) return;
    startAdd(async () => {
      const res = await addStudentWord(studentId, newFields.english, newFields.russian, newFields.setId || null);
      if (res.error || !res.word) {
        setAddError(res.error ?? "Не удалось добавить слово");
        return;
      }
      const w = res.word;
      setWords((prev) => [...prev, {
        id: w.id, english: w.english, russian: w.russian,
        setId: w.set_id, setName: w.setName, status: "queue", isOwn: true,
      }]);
      setSets((prev) => (prev.some((s) => s.id === w.set_id) ? prev : [...prev, { id: w.set_id, name: w.setName }]));
      setNewFields({ english: "", russian: "", setId: "" });
      setShowAdd(false);
    });
  }

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--brown-light)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: apple или яблоко…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border outline-none text-sm"
            style={input}
          />
        </div>
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border outline-none text-sm"
          style={input}
        >
          <option value="all">Все темы</option>
          {sets.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-2 rounded-xl border outline-none text-sm"
          style={input}
        >
          <option value="all">Любой статус</option>
          <option value="queue">Новые</option>
          <option value="learning">На изучении</option>
          <option value="mastered">Выученные</option>
        </select>
      </div>

      {/* Group toggle + count + add button */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--brown-light)" }}>
            {filtered.length} {filtered.length === 1 ? "слово" : filtered.length < 5 ? "слова" : "слов"}
          </span>
          <button
            type="button"
            onClick={() => setGrouped(true)}
            className="p-1.5 rounded-lg transition-all"
            style={{ background: grouped ? "var(--theme-accent)" : "transparent", color: grouped ? "#fff" : "var(--brown-light)" }}
            title="Группировать по темам"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            onClick={() => setGrouped(false)}
            className="p-1.5 rounded-lg transition-all"
            style={{ background: !grouped ? "var(--theme-accent)" : "transparent", color: !grouped ? "#fff" : "var(--brown-light)" }}
            title="Плоский список"
          >
            <Rows3 size={14} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white hover:opacity-80 transition-all"
          style={{ background: "var(--theme-accent)" }}
        >
          <Plus size={14} /> Добавить слово
        </button>
      </div>

      {/* Add word form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="rounded-xl border-2 border-dashed p-3.5 space-y-2" style={{ borderColor: "var(--theme-card-border)" }}>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <input
              value={newFields.english}
              onChange={(e) => setNewFields((f) => ({ ...f, english: e.target.value }))}
              placeholder="Слово"
              required
              className="flex-1 min-w-[120px] px-3 py-2 rounded-xl border outline-none text-sm"
              style={input}
            />
            <input
              value={newFields.russian}
              onChange={(e) => setNewFields((f) => ({ ...f, russian: e.target.value }))}
              placeholder="Перевод"
              required
              className="flex-1 min-w-[120px] px-3 py-2 rounded-xl border outline-none text-sm"
              style={input}
            />
            <select
              value={newFields.setId}
              onChange={(e) => setNewFields((f) => ({ ...f, setId: e.target.value }))}
              className="px-3 py-2 rounded-xl border outline-none text-sm"
              style={input}
            >
              <option value="">Мои слова</option>
              {sets.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {addError && <p className="text-xs text-red-600">{addError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={addPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80 disabled:opacity-50 transition-all"
              style={{ background: "var(--theme-accent)" }}
            >
              <Plus size={13} /> {addPending ? "Добавляю…" : "Добавить"}
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-2 rounded-xl text-sm border"
              style={{ borderColor: "var(--theme-card-border)", color: "var(--brown-light)" }}
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {/* Word list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-center py-10" style={{ color: "var(--brown-light)" }}>
          Ничего не найдено
        </p>
      ) : grouped ? (
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.setId}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--brown-mid)" }}>
                {g.name} <span style={{ fontWeight: 400 }}>({g.items.length})</span>
              </p>
              <div className="space-y-2">
                {g.items.map((w) => (
                  <WordRow
                    key={w.id}
                    word={w}
                    showTopic={false}
                    editing={editingId === w.id}
                    editFields={editFields}
                    onEditFieldsChange={setEditFields}
                    onEdit={() => startEditing(w)}
                    onSaveEdit={saveEdit}
                    onCancelEdit={() => setEditingId(null)}
                    onDelete={() => handleDelete(w.id)}
                    editPending={editPending}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((w) => (
            <WordRow
              key={w.id}
              word={w}
              showTopic
              editing={editingId === w.id}
              editFields={editFields}
              onEditFieldsChange={setEditFields}
              onEdit={() => startEditing(w)}
              onSaveEdit={saveEdit}
              onCancelEdit={() => setEditingId(null)}
              onDelete={() => handleDelete(w.id)}
              editPending={editPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
