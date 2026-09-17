import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { isGrammarAnswerCorrect } from "@/lib/grammar/checkAnswer";
import type { AutoQuestionType, HomeworkBlockType } from "@/app/actions/homework-blocks";
import HomeworkReviewPanel, { type ReviewBlock } from "../../HomeworkReviewPanel";

type BlockItemRow = {
  id: string; order_index: number; image_url: string | null; question: string | null;
  auto_type: AutoQuestionType | null; correct_answer: string | null; points: number;
};
type BlockRow = {
  id: string; order_index: number; type: HomeworkBlockType; instruction: string | null; words: string[] | null;
  homework_block_items: BlockItemRow[];
};

export default async function HomeworkReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: hw } = await supabase
    .from("homework")
    .select("id, title, description, status, student_id, students(name)")
    .eq("id", id)
    .eq("tutor_id", user.id)
    .single();
  if (!hw) notFound();

  const studentRel = hw.students as { name: string } | { name: string }[] | null;
  const studentName = (Array.isArray(studentRel) ? studentRel[0]?.name : studentRel?.name) ?? "Ученик";

  const db = createAdminClient();
  const { data: blocks } = await db
    .from("homework_blocks")
    .select("id, order_index, type, instruction, words, homework_block_items(id, order_index, image_url, question, auto_type, correct_answer, points)")
    .eq("homework_id", id)
    .order("order_index");
  if (!blocks || blocks.length === 0) notFound();

  const { data: attempt } = await db.from("homework_attempts").select("answers").eq("homework_id", id).maybeSingle();
  const answers = (attempt?.answers as Record<string, string>) ?? {};

  const allItemIds = ((blocks ?? []) as unknown as BlockRow[]).flatMap(b => (b.homework_block_items ?? []).map(i => i.id));
  const { data: reviewRows } = allItemIds.length > 0
    ? await db.from("homework_item_reviews").select("item_id, status, comment").in("item_id", allItemIds)
    : { data: [] as { item_id: string; status: string; comment: string | null }[] };
  const reviewMap = new Map((reviewRows ?? []).map(r => [r.item_id, r]));

  const reviewBlocks: ReviewBlock[] = ((blocks ?? []) as unknown as BlockRow[])
    .sort((a, b) => a.order_index - b.order_index)
    .map(b => ({
      id: b.id,
      type: b.type,
      instruction: b.instruction,
      words: b.words,
      items: [...(b.homework_block_items ?? [])]
        .sort((x, y) => x.order_index - y.order_index)
        .map(item => {
          const studentAnswer = answers[item.id] ?? "";
          const review = reviewMap.get(item.id);
          return {
            id: item.id,
            image_url: item.image_url,
            question: item.question,
            autoType: item.auto_type,
            correctAnswer: item.correct_answer,
            points: item.points,
            studentAnswer,
            autoCorrect: item.auto_type ? isGrammarAnswerCorrect(item.auto_type, studentAnswer, item.correct_answer ?? "") : null,
            reviewStatus: (review?.status as "pending" | "correct" | "incorrect") ?? "pending",
            reviewComment: review?.comment ?? null,
          };
        }),
    }));

  return (
    <div className="max-w-3xl">
      <Link href="/tutor/homework" className="flex items-center gap-1 text-sm mb-5 hover:opacity-70 transition-all" style={{ color: "var(--brown-mid)" }}>
        <ChevronLeft size={16} /> Домашние задания
      </Link>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--brown-dark)" }}>{hw.title}</h1>
      <p className="text-sm mb-6" style={{ color: "var(--brown-light)" }}>{studentName}{hw.description ? ` · ${hw.description}` : ""}</p>
      <HomeworkReviewPanel homeworkId={hw.id} initialStatus={hw.status} blocks={reviewBlocks} />
    </div>
  );
}
