import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send, RotateCcw, CheckCircle } from "lucide-react";
import { issueTest, retractTest } from "@/app/actions/tests";

const SECTION_LABEL: Record<string, string> = {
  listening: "Аудирование",
  reading: "Чтение",
  vocabulary: "Лексика и грамматика",
  writing: "Письмо",
};

const Q_LABEL: Record<string, string> = {
  mcq: "A/B/C/D",
  true_false: "True/False",
  fill_in: "Вписать ответ",
  match: "Соединить пары",
  gap_fill: "Вписать в пропуск",
  writing: "Свободный ответ",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Черновик",
  issued: "Выдан",
  in_progress: "Выполняется",
  submitted: "На проверке",
  graded: "Проверен",
};

export default async function TestViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: test } = await supabase
    .from("tests")
    .select("*, students(name, access_code)")
    .eq("id", id)
    .eq("tutor_id", user.id)
    .single();

  if (!test) notFound();

  const { data: sections } = await supabase
    .from("test_sections")
    .select("*, test_questions(*)")
    .eq("test_id", id)
    .order("order_index");

  const { data: answers } = await supabase
    .from("test_answers")
    .select("*, test_questions(prompt, type, points, options, correct_answer)")
    .eq("test_id", id);

  const student = test.students as { name: string; access_code: string } | null;
  const totalPoints = (sections ?? []).flatMap(s =>
    (s.test_questions as { points: number }[] ?? []).map(q => q.points)
  ).reduce((a, b) => a + b, 0);

  const card = { background: "white", borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" };

  return (
    <div className="max-w-3xl">
      <Link href="/tutor/tests"
        className="flex items-center gap-1 text-sm mb-5 hover:opacity-70 transition-all"
        style={{ color: "var(--brown-mid)" }}>
        <ChevronLeft size={16} /> Контрольные работы
      </Link>

      {/* Header */}
      <div className="rounded-2xl border p-5 mb-5" style={card}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold mb-1" style={{ color: "var(--brown-dark)" }}>{test.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm" style={{ color: "var(--brown-light)" }}>
              {student && <span>Ученик: <b style={{ color: "var(--brown-dark)" }}>{student.name}</b></span>}
              {test.time_limit_min && <span>Время: {test.time_limit_min} мин</span>}
              {test.issued_at && <span>Дата выдачи: {test.issued_at.slice(0, 10)}</span>}
              {totalPoints > 0 && <span>Всего баллов: {totalPoints}</span>}
            </div>
            {(test.score_5 || test.score_4 || test.score_3) && (
              <div className="flex gap-3 mt-2 flex-wrap text-xs">
                {test.score_5 && <span className="px-2 py-0.5 rounded-lg font-medium" style={{ background: "#d8f5e0", color: "#1a7a3a" }}>«5» от {test.score_5} б.</span>}
                {test.score_4 && <span className="px-2 py-0.5 rounded-lg font-medium" style={{ background: "#e8f0ff", color: "#2060d0" }}>«4» от {test.score_4} б.</span>}
                {test.score_3 && <span className="px-2 py-0.5 rounded-lg font-medium" style={{ background: "#fff3cc", color: "#c07800" }}>«3» от {test.score_3} б.</span>}
              </div>
            )}
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{
              background: { draft: "#f1f5f9", issued: "#e8f0ff", in_progress: "#fff3cc", submitted: "#f3e8ff", graded: "#d8f5e0" }[test.status] ?? "#f1f5f9",
              color: { draft: "#94a3b8", issued: "#2060d0", in_progress: "#c07800", submitted: "#7c3aed", graded: "#1a7a3a" }[test.status] ?? "#94a3b8",
            }}>
            {STATUS_LABEL[test.status] ?? test.status}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {test.status === "draft" && (
            <form action={async () => { "use server"; await issueTest(id); }}>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--gradient-primary)" }}>
                <Send size={13} /> Выдать ученику
              </button>
            </form>
          )}
          {test.status === "issued" && (
            <form action={async () => { "use server"; await retractTest(id); }}>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium"
                style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}>
                <RotateCcw size={13} /> Отозвать
              </button>
            </form>
          )}
          {test.status === "submitted" && (
            <Link href={`/tutor/tests/${id}/grade`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: "var(--gradient-primary)" }}>
              <CheckCircle size={13} /> Проверить письмо
            </Link>
          )}
          {student?.access_code && (
            <span className="text-xs px-3 py-2 rounded-xl border flex items-center gap-1"
              style={{ borderColor: "var(--brown-pale)", color: "var(--brown-light)" }}>
              Ссылка для ученика: /student/{student.access_code}?tab=tests
            </span>
          )}
        </div>

        {/* Results */}
        {test.status === "graded" && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: "#f8f4ee" }}>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--brown-dark)" }}>Результат</p>
            <div className="flex gap-6 flex-wrap text-sm" style={{ color: "var(--brown-mid)" }}>
              <span>Авто: {test.auto_score ?? 0} б.</span>
              <span>Письмо: {test.manual_score ?? 0} б.</span>
              <span>Итого: {(test.auto_score ?? 0) + (test.manual_score ?? 0)} б.</span>
              {test.grade && (
                <span className="font-bold text-base px-2 py-0.5 rounded-lg"
                  style={{ background: test.grade >= 4 ? "#d8f5e0" : test.grade === 3 ? "#fff3cc" : "#ffe0e0",
                           color: test.grade >= 4 ? "#1a7a3a" : test.grade === 3 ? "#c07800" : "#cc3030" }}>
                  Оценка: {test.grade}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sections and questions */}
      <div className="space-y-4">
        {(sections ?? []).map(section => {
          const qs = (section.test_questions as {
            id: string; type: string; prompt: string | null;
            options: Record<string, unknown> | null;
            correct_answer: Record<string, unknown> | null;
            points: number; order_index: number;
          }[]).sort((a, b) => a.order_index - b.order_index);

          const sectionAnswers = (answers ?? []).filter(a =>
            qs.some(q => q.id === a.question_id)
          );

          const sectionAutoScore = sectionAnswers.reduce((s, a) => s + (a.auto_score ?? 0), 0);
          const sectionManualScore = sectionAnswers.reduce((s, a) => s + (a.manual_score ?? 0), 0);
          const sectionMax = qs.reduce((s, q) => s + q.points, 0);

          return (
            <div key={section.id} className="rounded-2xl border p-4" style={card}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: "var(--brown-dark)" }}>
                  {SECTION_LABEL[section.type] ?? section.type}
                </h3>
                {test.status === "graded" && (
                  <span className="text-sm" style={{ color: "var(--brown-mid)" }}>
                    {sectionAutoScore + sectionManualScore} / {sectionMax} б.
                  </span>
                )}
              </div>

              {/* Listening media info */}
              {section.type === "listening" && section.media_url && (
                <div className="mb-3 text-xs p-2 rounded-lg" style={{ background: "#f1f5f9", color: "var(--brown-light)" }}>
                  {section.media_type === "youtube" ? "YouTube" :
                   section.media_type === "audio" ? "Аудиофайл" : "Внешняя ссылка"}:&nbsp;
                  <a href={section.media_url} target="_blank" rel="noopener noreferrer"
                    className="underline" style={{ color: "#2060d0" }}>
                    {section.media_url.slice(0, 60)}{section.media_url.length > 60 ? "…" : ""}
                  </a>
                  {" · "}Прослушиваний: {section.max_plays}
                  {section.hide_subtitles && " · Субтитры скрыты"}
                </div>
              )}

              <div className="space-y-2">
                {qs.map((q, qIdx) => {
                  const ans = sectionAnswers.find(a => a.question_id === q.id);
                  return (
                    <div key={q.id} className="p-3 rounded-xl text-sm"
                      style={{ background: "#f8f4ee", borderLeft: "3px solid var(--brown-pale)" }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <span className="font-medium" style={{ color: "var(--brown-light)" }}>
                            {qIdx + 1}. <span className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: "white", color: "var(--brown-mid)" }}>
                              {Q_LABEL[q.type]}
                            </span>
                          </span>
                          {q.prompt && (
                            <p className="mt-1" style={{ color: "var(--brown-dark)" }}>{q.prompt}</p>
                          )}

                          {/* Options preview */}
                          {q.type === "mcq" && q.options?.choices && (
                            <div className="mt-1.5 space-y-0.5">
                              {(q.options.choices as string[]).map((c, ci) => {
                                const letter = ["A", "B", "C", "D"][ci];
                                const isCorrect = (q.correct_answer as { answer: string })?.answer === letter;
                                const studentPicked = ans ? (ans.answer as { answer: string })?.answer === letter : false;
                                return (
                                  <div key={ci} className="flex items-center gap-1.5"
                                    style={{ color: isCorrect ? "#1a7a3a" : "var(--brown-light)" }}>
                                    <span className="font-bold">{letter}.</span> {c}
                                    {isCorrect && " ✓"}
                                    {studentPicked && !isCorrect && " ✗"}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "writing" && ans && (
                            <div className="mt-2 p-2 rounded-lg" style={{ background: "white" }}>
                              <p style={{ color: "var(--brown-dark)" }}>
                                {(ans.answer as { text: string })?.text ?? "—"}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-medium" style={{ color: "var(--brown-mid)" }}>
                            {ans ? (
                              <span style={{ color: ans.is_correct ? "#1a7a3a" : "var(--brown-mid)" }}>
                                {(ans.auto_score ?? 0) + (ans.manual_score ?? 0)} / {q.points}
                              </span>
                            ) : (
                              <span style={{ color: "var(--brown-light)" }}>{q.points} б.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
