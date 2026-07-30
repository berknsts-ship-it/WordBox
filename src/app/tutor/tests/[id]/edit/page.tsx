import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import TestBuilder, {
  type Section, type SectionType, type Question, type QType, type MediaType, type TestBuilderInitial,
} from "../../new/TestBuilder";

type QuestionRow = {
  id: string; type: string; prompt: string | null;
  options: Record<string, unknown> | null;
  correct_answer: Record<string, unknown> | null;
  points: number; order_index: number;
};
type TaskRow = { id: string; order_index: number; title: string | null; instruction: string | null; test_questions: QuestionRow[] };
type SectionRow = {
  type: SectionType; media_type: string | null; media_url: string | null;
  max_plays: number; hide_subtitles: boolean; test_tasks: TaskRow[];
};

function dbQuestionToFormQuestion(q: QuestionRow): Question {
  const base: Question = {
    _id: q.id,
    type: q.type as QType,
    prompt: q.prompt ?? "",
    points: q.points,
    choices: ["", "", "", ""],
    mcqCorrect: "A",
    tfCorrect: "true",
    fillCorrect: "",
    matchLeft: ["", ""],
    matchRight: ["", ""],
    matchCorrect: [0, 1],
    gapTemplate: "",
    gapCorrect: [],
  };
  const opts = q.options ?? {};
  const ans = q.correct_answer ?? {};
  switch (q.type) {
    case "mcq":
      return { ...base, choices: (opts.choices as [string, string, string, string]) ?? base.choices, mcqCorrect: (ans.answer as "A" | "B" | "C" | "D") ?? "A" };
    case "true_false":
      return { ...base, tfCorrect: (ans.answer as "true" | "false") ?? "true" };
    case "fill_in":
      return { ...base, fillCorrect: (ans.answer as string) ?? "" };
    case "match":
      return { ...base, matchLeft: (opts.left as string[]) ?? [], matchRight: (opts.right as string[]) ?? [], matchCorrect: (ans.matches as number[]) ?? [] };
    case "gap_fill":
      return { ...base, gapTemplate: (opts.template as string) ?? "", gapCorrect: (ans.gaps as string[]) ?? [] };
    default:
      return base;
  }
}

function emptySection(type: SectionType): Section {
  return {
    type, enabled: false, tasks: [],
    mediaType: "audio", mediaUrl: "", mediaFile: null, maxPlays: 2, hideSubtitles: false,
    writingPrompt: "", writingPoints: 10,
  };
}

function buildInitialSections(dbSections: SectionRow[]): Section[] {
  const order: SectionType[] = ["listening", "reading", "vocabulary", "writing"];
  return order.map((type) => {
    const dbSec = dbSections.find((s) => s.type === type);
    if (!dbSec) return emptySection(type);

    if (type === "writing") {
      const firstQ = [...dbSec.test_tasks]
        .sort((a, b) => a.order_index - b.order_index)[0]
        ?.test_questions?.[0];
      return {
        ...emptySection(type),
        enabled: true,
        writingPrompt: firstQ?.prompt ?? "",
        writingPoints: firstQ?.points ?? 10,
      };
    }

    return {
      type,
      enabled: true,
      tasks: [...dbSec.test_tasks]
        .sort((a, b) => a.order_index - b.order_index)
        .map((t) => ({
          _id: t.id,
          title: t.title ?? "",
          instruction: t.instruction ?? "",
          questions: [...t.test_questions]
            .sort((a, b) => a.order_index - b.order_index)
            .map(dbQuestionToFormQuestion),
        })),
      mediaType: (dbSec.media_type as MediaType) ?? "audio",
      mediaUrl: dbSec.media_url ?? "",
      mediaFile: null,
      maxPlays: dbSec.max_plays ?? 2,
      hideSubtitles: dbSec.hide_subtitles ?? false,
      writingPrompt: "",
      writingPoints: 10,
    };
  });
}

export default async function EditTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: test } = await supabase
    .from("tests")
    .select("*")
    .eq("id", id)
    .eq("tutor_id", user.id)
    .single();

  if (!test) notFound();
  if (test.status !== "draft") redirect(`/tutor/tests/${id}`);

  const { data: students } = await supabase
    .from("students")
    .select("id, name")
    .eq("tutor_id", user.id)
    .order("name");

  const { data: sections } = await supabase
    .from("test_sections")
    .select("type, media_type, media_url, max_plays, hide_subtitles, test_tasks(id, order_index, title, instruction, test_questions(id, type, prompt, options, correct_answer, points, order_index))")
    .eq("test_id", id);

  const initial: TestBuilderInitial = {
    title: test.title,
    studentId: test.student_id ?? "",
    timeLimitMin: test.time_limit_min ? String(test.time_limit_min) : "",
    issuedAt: test.issued_at ? test.issued_at.slice(0, 10) : "",
    score5: test.score_5 != null ? String(test.score_5) : "",
    score4: test.score_4 != null ? String(test.score_4) : "",
    score3: test.score_3 != null ? String(test.score_3) : "",
    sections: buildInitialSections((sections ?? []) as unknown as SectionRow[]),
  };

  return (
    <div>
      <Link href={`/tutor/tests/${id}`}
        className="flex items-center gap-1 text-sm mb-5 hover:opacity-70 transition-all"
        style={{ color: "var(--brown-mid)" }}>
        <ChevronLeft size={16} /> Назад к тесту
      </Link>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--brown-dark)" }}>
        Редактирование теста
      </h1>
      <TestBuilder students={students ?? []} existingTestId={id} initial={initial} />
    </div>
  );
}
