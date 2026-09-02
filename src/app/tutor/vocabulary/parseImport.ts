import type { VocabularySetInput, VocabularyWordInput } from "@/app/actions/vocabulary";

export type ParseResult =
  | { ok: true; data: VocabularySetInput }
  | { ok: false; error: string };

const OPTIONAL_STRING_FIELDS = ["example", "example_sentence", "bracket_sentence", "bracket_answer"] as const;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseWord(raw: unknown, wordNum: number): VocabularyWordInput | string {
  const label = `Слово ${wordNum}`;
  if (!isPlainObject(raw)) return `${label}: должно быть объектом {english, russian, ...}`;

  const english = raw.english;
  if (typeof english !== "string" || !english.trim()) {
    return `${label}: отсутствует или пустое поле english`;
  }
  const russian = raw.russian;
  if (typeof russian !== "string" || !russian.trim()) {
    return `${label}: отсутствует или пустое поле russian`;
  }

  const optional: Record<string, string | null> = {};
  for (const field of OPTIONAL_STRING_FIELDS) {
    const v = raw[field];
    if (v === undefined || v === null || v === "") { optional[field] = null; continue; }
    if (typeof v !== "string") return `${label}: поле ${field} должно быть строкой`;
    optional[field] = v.trim();
  }

  let answerVariants: string[] = [];
  if (raw.answer_variants !== undefined && raw.answer_variants !== null) {
    if (!Array.isArray(raw.answer_variants) || !raw.answer_variants.every(v => typeof v === "string")) {
      return `${label}: поле answer_variants должно быть массивом строк`;
    }
    answerVariants = raw.answer_variants as string[];
  }

  return {
    english: english.trim(),
    russian: russian.trim(),
    example: optional.example,
    example_sentence: optional.example_sentence,
    bracket_sentence: optional.bracket_sentence,
    bracket_answer: optional.bracket_answer,
    answer_variants: answerVariants,
  };
}

export function parseVocabularySetImport(raw: string): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    return { ok: false, error: `Не удалось разобрать JSON: ${e instanceof Error ? e.message : "неизвестная ошибка"}` };
  }

  if (!isPlainObject(json)) {
    return { ok: false, error: "Ожидается объект вида {title, words}" };
  }

  const title = json.title;
  if (typeof title !== "string" || !title.trim()) {
    return { ok: false, error: "Отсутствует или пустое поле title" };
  }

  if (!Array.isArray(json.words) || json.words.length === 0) {
    return { ok: false, error: "Нужен непустой массив words" };
  }

  const words: VocabularyWordInput[] = [];
  for (let i = 0; i < json.words.length; i++) {
    const result = parseWord(json.words[i], i + 1);
    if (typeof result === "string") return { ok: false, error: result };
    words.push(result);
  }

  return { ok: true, data: { title: title.trim(), words } };
}
