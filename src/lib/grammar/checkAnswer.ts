import type { ExerciseType } from "@/app/actions/grammar";

function normalize(s: string): string {
  // ’ ‘ ` → ' : phones auto-insert curly apostrophes (doesn’t), which must
  // still match an answer key typed with a straight one.
  return s.trim().toLowerCase().replace(/[’‘`]/g, "'").replace(/\s+/g, " ").replace(/[.!?,;:]+$/g, "");
}

// Автопроверка: регистронезависимо, с учётом нескольких вариантов ответа
// через "|" (кроме mcq/true_false, где вариант ровно один по определению).
export function isGrammarAnswerCorrect(type: ExerciseType, submitted: string | undefined | null, correctAnswer: string): boolean {
  if (!submitted || !submitted.trim()) return false;

  if (type === "mcq") return submitted.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
  if (type === "true_false") return submitted.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

  const variants = correctAnswer.split("|").map(normalize);
  return variants.includes(normalize(submitted));
}
