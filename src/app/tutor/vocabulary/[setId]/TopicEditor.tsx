"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Volume2, Check, X, Pencil } from "lucide-react";
import { addWord, updateWord, deleteWord, updateTopicName, setVocabularyAssignments } from "@/app/actions/vocabulary";

interface Word {
  id: string;
  english: string;
  russian: string;
  example: string | null;
  example_sentence: string | null;
  bracket_sentence: string | null;
  bracket_answer: string | null;
}

interface Student { id: string; name: string; }

interface Props {
  setId: string;
  initialName: string;
  initialWords: Word[];
  allStudents: Student[];
  assignedIds: string[];
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

export default function TopicEditor({ setId, initialName, initialWords, allStudents, assignedIds }: Props) {
  const [words, setWords] = useState<Word[]>(initialWords);
  const [topicName, setTopicName] = useState(initialName);
  const [selectedStudents, setSelectedStudents] = useState(() => new Set(assignedIds));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ english: "", russian: "", example: "", sentence: "", bracketSentence: "", bracketAnswer: "" });
  const [newFields, setNewFields] = useState({ english: "", russian: "", example: "", sentence: "", bracketSentence: "", bracketAnswer: "" });

  const [namePending, startName] = useTransition();
  const [nameSaved, setNameSaved] = useState(false);
  const [assignPending, startAssign] = useTransition();
  const [assignSaved, setAssignSaved] = useState(false);
  const [addPending, startAdd] = useTransition();
  const [editPending, startEdit] = useTransition();
  const [delPending, startDel] = useTransition();

  const input = {
    background: "var(--cream)",
    border: "1.5px solid var(--brown-pale)",
    color: "var(--brown-dark)",
  };
  const card = { background: "white", borderColor: "var(--brown-pale)" };

  function saveName() {
    startName(async () => {
      await updateTopicName(setId, topicName);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    });
  }

  function toggleStudent(id: string) {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function saveAssignments() {
    startAssign(async () => {
      await setVocabularyAssignments(setId, [...selectedStudents]);
      setAssignSaved(true);
      setTimeout(() => setAssignSaved(false), 2000);
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newFields.english.trim() || !newFields.russian.trim()) return;
    const fd = new FormData();
    fd.set("set_id", setId);
    fd.set("english", newFields.english.trim());
    fd.set("russian", newFields.russian.trim());
    fd.set("example", newFields.example.trim());
    fd.set("example_sentence", newFields.sentence.trim());
    fd.set("bracket_sentence", newFields.bracketSentence.trim());
    fd.set("bracket_answer", newFields.bracketAnswer.trim());
    fd.set("answer_variants", "");
    startAdd(async () => {
      const res = await addWord(fd);
      if (res.ok && res.word) {
        setWords((w) => [...w, res.word as unknown as Word]);
        setNewFields({ english: "", russian: "", example: "", sentence: "", bracketSentence: "", bracketAnswer: "" });
      }
    });
  }

  function startEditing(w: Word) {
    setEditingId(w.id);
    setEditFields({
      english: w.english,
      russian: w.russian,
      example: w.example ?? "",
      sentence: w.example_sentence ?? "",
      bracketSentence: w.bracket_sentence ?? "",
      bracketAnswer: w.bracket_answer ?? "",
    });
  }

  function saveEdit() {
    if (!editingId) return;
    const fd = new FormData();
    fd.set("id", editingId);
    fd.set("set_id", setId);
    fd.set("english", editFields.english.trim());
    fd.set("russian", editFields.russian.trim());
    fd.set("example", editFields.example.trim());
    fd.set("example_sentence", editFields.sentence.trim());
    fd.set("bracket_sentence", editFields.bracketSentence.trim());
    fd.set("bracket_answer", editFields.bracketAnswer.trim());
    fd.set("answer_variants", "");
    startEdit(async () => {
      await updateWord(fd);
      setWords((ws) =>
        ws.map((w) =>
          w.id === editingId
            ? {
                ...w,
                english: editFields.english.trim(),
                russian: editFields.russian.trim(),
                example: editFields.example.trim() || null,
                example_sentence: editFields.sentence.trim() || null,
                bracket_sentence: editFields.bracketSentence.trim() || null,
                bracket_answer: editFields.bracketAnswer.trim() || null,
              }
            : w
        )
      );
      setEditingId(null);
    });
  }

  function handleDelete(wordId: string) {
    startDel(async () => {
      await deleteWord(wordId, setId);
      setWords((ws) => ws.filter((w) => w.id !== wordId));
    });
  }

  return (
    <div className="space-y-6">
      {/* Название */}
      <div className="rounded-2xl border p-5" style={card}>
        <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--brown-mid)" }}>
          Название темы
        </label>
        <div className="flex gap-2">
          <input
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border outline-none text-sm"
            style={input}
          />
          <button
            type="button"
            onClick={saveName}
            disabled={namePending || topicName === initialName}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80 disabled:opacity-40 transition-all"
            style={{ background: "var(--gradient-primary)" }}
          >
            {nameSaved ? <><Check size={13} /> Сохранено</> : namePending ? "…" : "Сохранить"}
          </button>
        </div>
      </div>

      {/* Назначить ученикам */}
      {allStudents.length > 0 && (
        <div className="rounded-2xl border p-5" style={card}>
          <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--brown-mid)" }}>
            Назначить ученикам
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {allStudents.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer hover:opacity-80 transition-all text-sm"
                style={{
                  borderColor: selectedStudents.has(s.id) ? "var(--brown-mid)" : "var(--brown-pale)",
                  background: selectedStudents.has(s.id) ? "var(--cream)" : "white",
                  color: "var(--brown-dark)",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.has(s.id)}
                  onChange={() => toggleStudent(s.id)}
                  className="w-3.5 h-3.5 accent-amber-700"
                />
                {s.name}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={saveAssignments}
            disabled={assignPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80 disabled:opacity-50 transition-all"
            style={{ background: "var(--gradient-primary)" }}
          >
            {assignSaved ? <><Check size={13} /> Сохранено</> : assignPending ? "…" : "Сохранить назначение"}
          </button>
        </div>
      )}

      {/* Список слов */}
      <div>
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--brown-dark)" }}>
          Слова <span style={{ color: "var(--brown-light)", fontWeight: 400 }}>({words.length})</span>
        </p>

        <div className="space-y-2 mb-4">
          {words.map((w) => (
            <div key={w.id} className="rounded-xl border p-3.5" style={card}>
              {editingId === w.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex gap-1.5">
                      <input
                        value={editFields.english}
                        onChange={(e) => setEditFields((f) => ({ ...f, english: e.target.value }))}
                        className="flex-1 px-3 py-1.5 rounded-lg border outline-none text-sm"
                        style={input}
                        placeholder="Слово"
                      />
                      <button
                        type="button"
                        onClick={() => speak(editFields.english)}
                        disabled={!editFields.english}
                        className="px-2 rounded-lg border hover:opacity-80 disabled:opacity-30"
                        style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                    <input
                      value={editFields.russian}
                      onChange={(e) => setEditFields((f) => ({ ...f, russian: e.target.value }))}
                      className="px-3 py-1.5 rounded-lg border outline-none text-sm"
                      style={input}
                      placeholder="Перевод"
                    />
                  </div>
                  <input
                    value={editFields.example}
                    onChange={(e) => setEditFields((f) => ({ ...f, example: e.target.value }))}
                    placeholder="Пример"
                    className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm"
                    style={input}
                  />
                  <div className="rounded-lg p-2.5 space-y-1.5" style={{ background: "var(--cream)" }}>
                    <p className="text-xs font-semibold" style={{ color: "var(--brown-mid)" }}>Вставить слово</p>
                    <input
                      value={editFields.sentence}
                      onChange={(e) => setEditFields((f) => ({ ...f, sentence: e.target.value }))}
                      placeholder="She ___ every day."
                      className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm bg-white"
                      style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}
                    />
                  </div>
                  <div className="rounded-lg p-2.5 space-y-1.5" style={{ background: "var(--cream)" }}>
                    <p className="text-xs font-semibold" style={{ color: "var(--brown-mid)" }}>Раскрыть скобки</p>
                    <input
                      value={editFields.bracketSentence}
                      onChange={(e) => setEditFields((f) => ({ ...f, bracketSentence: e.target.value }))}
                      placeholder="She (go) every day."
                      className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm bg-white"
                      style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}
                    />
                    <input
                      value={editFields.bracketAnswer}
                      onChange={(e) => setEditFields((f) => ({ ...f, bracketAnswer: e.target.value }))}
                      placeholder="Правильный ответ: goes"
                      className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm bg-white"
                      style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={editPending}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-80 disabled:opacity-50"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <Check size={12} /> {editPending ? "…" : "Сохранить"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border hover:opacity-80"
                      style={{ borderColor: "var(--brown-pale)", color: "var(--brown-light)" }}
                    >
                      <X size={12} /> Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: "var(--brown-dark)" }}>{w.english}</span>
                      <button
                        type="button"
                        onClick={() => speak(w.english)}
                        className="opacity-40 hover:opacity-80 transition-all"
                        style={{ color: "var(--brown-mid)" }}
                      >
                        <Volume2 size={12} />
                      </button>
                      <span className="text-sm" style={{ color: "var(--brown-mid)" }}>— {w.russian}</span>
                    </div>
                    {w.example && (
                      <p className="text-xs italic mt-0.5 truncate" style={{ color: "var(--brown-light)" }}>
                        {w.example}
                      </p>
                    )}
                    {w.example_sentence && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--brown-mid)" }}>
                        📝 {w.example_sentence}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditing(w)}
                      className="p-1.5 rounded-lg hover:opacity-70 transition-all"
                      style={{ color: "var(--brown-mid)" }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(w.id)}
                      disabled={delPending}
                      className="p-1.5 rounded-lg hover:opacity-70 transition-all"
                      style={{ color: "#c06040" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Добавить слово */}
        <form
          onSubmit={handleAdd}
          className="rounded-xl border-2 border-dashed p-4 space-y-2.5"
          style={{ borderColor: "var(--brown-pale)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--brown-light)" }}>
            Добавить слово
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex gap-1.5">
              <input
                value={newFields.english}
                onChange={(e) => setNewFields((f) => ({ ...f, english: e.target.value }))}
                placeholder="Слово / фраза"
                required
                className="flex-1 px-3 py-2 rounded-xl border outline-none text-sm"
                style={input}
              />
              <button
                type="button"
                onClick={() => speak(newFields.english)}
                disabled={!newFields.english}
                className="px-2.5 rounded-xl border hover:opacity-80 disabled:opacity-30"
                style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}
              >
                <Volume2 size={13} />
              </button>
            </div>
            <input
              value={newFields.russian}
              onChange={(e) => setNewFields((f) => ({ ...f, russian: e.target.value }))}
              placeholder="Перевод"
              required
              className="px-3 py-2 rounded-xl border outline-none text-sm"
              style={input}
            />
          </div>
          <input
            value={newFields.example}
            onChange={(e) => setNewFields((f) => ({ ...f, example: e.target.value }))}
            placeholder="Пример предложения"
            className="w-full px-3 py-2 rounded-xl border outline-none text-sm"
            style={input}
          />
          <div className="rounded-xl p-3 space-y-1.5" style={{ background: "var(--cream)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--brown-mid)" }}>Вставить слово</p>
            <input
              value={newFields.sentence}
              onChange={(e) => setNewFields((f) => ({ ...f, sentence: e.target.value }))}
              placeholder="She ___ every day."
              className="w-full px-3 py-2 rounded-lg border outline-none text-sm bg-white"
              style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>
          <div className="rounded-xl p-3 space-y-1.5" style={{ background: "var(--cream)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--brown-mid)" }}>Раскрыть скобки</p>
            <input
              value={newFields.bracketSentence}
              onChange={(e) => setNewFields((f) => ({ ...f, bracketSentence: e.target.value }))}
              placeholder="She (go) every day."
              className="w-full px-3 py-2 rounded-lg border outline-none text-sm bg-white"
              style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}
            />
            <input
              value={newFields.bracketAnswer}
              onChange={(e) => setNewFields((f) => ({ ...f, bracketAnswer: e.target.value }))}
              placeholder="Правильный ответ: goes"
              className="w-full px-3 py-2 rounded-lg border outline-none text-sm bg-white"
              style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>
          <button
            type="submit"
            disabled={addPending || !newFields.english.trim() || !newFields.russian.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80 disabled:opacity-40 transition-all"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus size={14} /> {addPending ? "Добавляю…" : "Добавить"}
          </button>
        </form>
      </div>
    </div>
  );
}
