import type { SetInput, ExerciseBlockInput, ItemInput, ExerciseType } from "@/app/actions/grammar";

const VALID_TYPES: ExerciseType[] = ["bracket", "mcq", "true_false", "fix_error", "gap_fill", "word_order"];

export type ParseResult =
  | { ok: true; data: SetInput }
  | { ok: false; error: string };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseItem(raw: unknown, type: ExerciseType, blockLabel: string, itemNum: number): ItemInput | string {
  if (!isPlainObject(raw)) return `${blockLabel}, пункт ${itemNum}: должен быть объектом {question, correct_answer, ...}`;

  const correctAnswer = raw.correct_answer;
  if (typeof correctAnswer !== "string" || !correctAnswer.trim()) {
    return `${blockLabel}, пункт ${itemNum}: отсутствует или пустой correct_answer`;
  }

  let question = raw.question;
  if (type === "word_order" && (question === undefined || question === null || question === "")) {
    question = correctAnswer; // для "Порядок слов" question можно не указывать — берём correct_answer
  }
  if (typeof question !== "string" || !question.trim()) {
    return `${blockLabel}, пункт ${itemNum}: отсутствует или пустой question`;
  }

  if (type === "mcq") {
    if (!Array.isArray(raw.options) || raw.options.length !== 4 || !raw.options.every(o => typeof o === "string")) {
      return `${blockLabel}, пункт ${itemNum}: для типа mcq нужен массив options из 4 строк`;
    }
    if (!["A", "B", "C", "D"].includes(correctAnswer)) {
      return `${blockLabel}, пункт ${itemNum}: для типа mcq correct_answer должен быть "A", "B", "C" или "D"`;
    }
  }
  if (type === "true_false" && correctAnswer !== "true" && correctAnswer !== "false") {
    return `${blockLabel}, пункт ${itemNum}: для типа true_false correct_answer должен быть "true" или "false"`;
  }

  const pointsRaw = raw.points;
  const points = pointsRaw === undefined ? 1 : Number(pointsRaw);
  if (!Number.isFinite(points) || points <= 0) {
    return `${blockLabel}, пункт ${itemNum}: points должен быть положительным числом`;
  }

  const explanation = raw.explanation;
  if (explanation !== undefined && explanation !== null && typeof explanation !== "string") {
    return `${blockLabel}, пункт ${itemNum}: explanation должен быть строкой`;
  }

  return {
    question,
    correct_answer: correctAnswer,
    options: type === "mcq" ? (raw.options as string[]) : null,
    points,
    explanation: (explanation as string | null | undefined) ?? null,
  };
}

function parseBlock(raw: unknown, blockNum: number): ExerciseBlockInput | string {
  const blockLabel = `Упражнение ${blockNum}`;
  if (!isPlainObject(raw)) return `${blockLabel}: должно быть объектом {type, instruction, items}`;

  const type = raw.type;
  if (typeof type !== "string" || !VALID_TYPES.includes(type as ExerciseType)) {
    return `${blockLabel}: type должен быть одним из: ${VALID_TYPES.join(", ")}`;
  }

  const instruction = raw.instruction;
  if (instruction !== undefined && instruction !== null && typeof instruction !== "string") {
    return `${blockLabel}: instruction должен быть строкой`;
  }

  if (!Array.isArray(raw.items) || raw.items.length === 0) {
    return `${blockLabel}: нужен непустой массив items`;
  }

  const items: ItemInput[] = [];
  for (let i = 0; i < raw.items.length; i++) {
    const result = parseItem(raw.items[i], type as ExerciseType, blockLabel, i + 1);
    if (typeof result === "string") return result;
    items.push(result);
  }

  return {
    type: type as ExerciseType,
    instruction: (instruction as string | null | undefined)?.trim() || null,
    items,
  };
}

export function parseGrammarSetImport(raw: string): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    return { ok: false, error: `Не удалось разобрать JSON: ${e instanceof Error ? e.message : "неизвестная ошибка"}` };
  }

  if (!isPlainObject(json)) {
    return { ok: false, error: "Ожидается объект вида {title, description, exercises}" };
  }

  const title = json.title;
  if (typeof title !== "string" || !title.trim()) {
    return { ok: false, error: "Отсутствует или пустое поле title" };
  }

  const description = json.description;
  if (description !== undefined && description !== null && typeof description !== "string") {
    return { ok: false, error: "Поле description должно быть строкой" };
  }

  if (!Array.isArray(json.exercises) || json.exercises.length === 0) {
    return { ok: false, error: "Нужен непустой массив exercises" };
  }

  const exercises: ExerciseBlockInput[] = [];
  for (let i = 0; i < json.exercises.length; i++) {
    const result = parseBlock(json.exercises[i], i + 1);
    if (typeof result === "string") return { ok: false, error: result };
    exercises.push(result);
  }

  return {
    ok: true,
    data: {
      title: title.trim(),
      description: (description as string | null | undefined)?.trim() || null,
      exercises,
    },
  };
}
