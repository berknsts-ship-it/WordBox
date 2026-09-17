"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Circle } from "lucide-react";
import { saveItemReview, finalizeHomeworkReview, type HomeworkBlockType, type AutoQuestionType } from "@/app/actions/homework-blocks";

export type ReviewItem = {
  id: string;
  image_url: string | null;
  question: string | null;
  autoType: AutoQuestionType | null;
  correctAnswer: string | null;
  points: number;
  studentAnswer: string;
  autoCorrect: boolean | null;
  reviewStatus: "pending" | "correct" | "incorrect";
  reviewComment: string | null;
};
export type ReviewBlock = { id: string; type: HomeworkBlockType; instruction: string | null; words: string[] | null; items: ReviewItem[] };

const card = { background: "white", borderColor: "var(--brown-pale)" };

function StatusToggle({ status, onChange }: { status: "pending" | "correct" | "incorrect"; onChange: (s: "correct" | "incorrect") => void }) {
  return (
    <div className="flex gap-1.5 shrink-0">
      <button type="button" onClick={() => onChange("correct")}
        className="w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all"
        style={status === "correct" ? { borderColor: "#2a7a3a", background: "#e6f7e6", color: "#2a7a3a" } : { borderColor: "var(--brown-pale)", color: "var(--brown-light)" }}>
        <CheckCircle2 size={16} />
      </button>
      <button type="button" onClick={() => onChange("incorrect")}
        className="w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all"
        style={status === "incorrect" ? { borderColor: "#c0392b", background: "#fbe9e7", color: "#c0392b" } : { borderColor: "var(--brown-pale)", color: "var(--brown-light)" }}>
        <XCircle size={16} />
      </button>
    </div>
  );
}

function ManualItem({ item, onUpdate }: { item: ReviewItem; onUpdate: (patch: Partial<ReviewItem>) => void }) {
  const [comment, setComment] = useState(item.reviewComment ?? "");

  const setStatus = (status: "correct" | "incorrect") => {
    const next = status === item.reviewStatus ? "pending" : status;
    onUpdate({ reviewStatus: next });
    saveItemReview(item.id, next, comment || null);
  };
  const saveComment = () => saveItemReview(item.id, item.reviewStatus, comment || null);

  return (
    <div className="rounded-xl border p-3 space-y-2" style={{ borderColor: "var(--brown-pale)", background: "#fefcf8" }}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {item.question && <p className="text-xs mb-1.5" style={{ color: "var(--brown-light)" }}>{item.question}</p>}
          {item.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt="" className="w-full max-w-[220px] rounded-lg border mb-2" style={{ borderColor: "var(--brown-pale)" }} />
          )}
          <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "white", border: "1px solid var(--brown-pale)", color: "var(--brown-dark)" }}>
            {item.studentAnswer || <span style={{ color: "var(--brown-light)" }}>— пусто —</span>}
          </p>
        </div>
        <StatusToggle status={item.reviewStatus} onChange={setStatus} />
      </div>
      <input value={comment} onChange={e => setComment(e.target.value)} onBlur={saveComment}
        placeholder="Комментарий/исправление для ученика (необязательно)"
        className="w-full px-3 py-1.5 rounded-lg border outline-none text-xs" style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }} />
    </div>
  );
}

function AutoItem({ item }: { item: ReviewItem }) {
  return (
    <div className="rounded-xl border p-3 space-y-1.5" style={{ borderColor: "var(--brown-pale)", background: "#fefcf8" }}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm mb-1" style={{ color: "var(--brown-dark)" }}>{item.question}</p>
          <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "white", border: "1px solid var(--brown-pale)", color: "var(--brown-dark)" }}>
            {item.studentAnswer || <span style={{ color: "var(--brown-light)" }}>— пусто —</span>}
          </p>
          {!item.autoCorrect && (
            <p className="text-xs mt-1" style={{ color: "#2a7a3a" }}>Правильно: {item.correctAnswer}</p>
          )}
        </div>
        <div className="shrink-0">
          {item.autoCorrect
            ? <CheckCircle2 size={20} style={{ color: "#2a7a3a" }} />
            : <XCircle size={20} style={{ color: "#c0392b" }} />}
        </div>
      </div>
    </div>
  );
}

function BlockSection({ block, onUpdateItem }: { block: ReviewBlock; onUpdateItem: (blockId: string, itemId: string, patch: Partial<ReviewItem>) => void }) {
  if (block.type === "instruction") {
    return (
      <div className="rounded-2xl border p-4" style={{ background: "#f5ece3", borderColor: "var(--brown-pale)" }}>
        <p className="text-sm" style={{ color: "var(--brown-dark)" }}>{block.instruction}</p>
      </div>
    );
  }
  if (block.type === "word_bank") {
    return (
      <div className="rounded-2xl border p-4" style={{ ...card }}>
        <div className="flex flex-wrap gap-1.5">
          {(block.words ?? []).map((w, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "#f5ece3", color: "var(--brown-dark)" }}>{w}</span>
          ))}
        </div>
      </div>
    );
  }

  const isAuto = block.type === "auto_question";
  return (
    <div className="rounded-2xl border p-4 space-y-2.5" style={{ ...card }}>
      {block.instruction && <p className="text-sm font-medium" style={{ color: "var(--brown-dark)" }}>{block.instruction}</p>}
      {block.items.map(item => isAuto
        ? <AutoItem key={item.id} item={item} />
        : <ManualItem key={item.id} item={item} onUpdate={patch => onUpdateItem(block.id, item.id, patch)} />
      )}
    </div>
  );
}

export default function HomeworkReviewPanel({
  homeworkId, initialStatus, blocks: initialBlocks,
}: {
  homeworkId: string;
  initialStatus: string;
  blocks: ReviewBlock[];
}) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [finalized, setFinalized] = useState(initialStatus === "checked");
  const [sending, setSending] = useState(false);

  const updateItem = (blockId: string, itemId: string, patch: Partial<ReviewItem>) => {
    setBlocks(prev => prev.map(b => b.id !== blockId ? b : {
      ...b, items: b.items.map(it => it.id !== itemId ? it : { ...it, ...patch }),
    }));
  };

  const gradable = blocks.filter(b => b.type !== "instruction" && b.type !== "word_bank").flatMap(b => b.items);
  const totalPoints = gradable.reduce((s, it) => s + it.points, 0);
  const earnedPoints = gradable.reduce((s, it) => {
    const correct = it.autoType ? it.autoCorrect : it.reviewStatus === "correct";
    return s + (correct ? it.points : 0);
  }, 0);
  const pendingManual = gradable.filter(it => !it.autoType && it.reviewStatus === "pending").length;

  async function handleFinalize() {
    setSending(true);
    const res = await finalizeHomeworkReview(homeworkId);
    setSending(false);
    if (res.error) return;
    setFinalized(true);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4 flex items-center justify-between" style={{ ...card }}>
        <p className="text-sm font-semibold" style={{ color: "var(--brown-dark)" }}>
          Результат: {earnedPoints} / {totalPoints} баллов
        </p>
        {pendingManual > 0 && !finalized && (
          <p className="text-xs flex items-center gap-1" style={{ color: "#8a6200" }}>
            <Circle size={10} /> Не проверено вручную: {pendingManual}
          </p>
        )}
      </div>

      {blocks.map(block => <BlockSection key={block.id} block={block} onUpdateItem={updateItem} />)}

      <div className="flex items-center justify-between rounded-2xl border p-4" style={{ ...card }}>
        {finalized ? (
          <p className="text-sm font-semibold" style={{ color: "#2a7a3a" }}>✅ Результат отправлен ученику</p>
        ) : (
          <>
            <p className="text-xs" style={{ color: "var(--brown-light)" }}>Отметки сохраняются сразу</p>
            <button type="button" onClick={handleFinalize} disabled={sending}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-all"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}>
              {sending ? "Отправляем…" : "Отправить результат ученику"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
