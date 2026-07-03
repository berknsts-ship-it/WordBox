"use server";

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type WordRow = { english: string; russian: string; example: string };

export async function generateVocabularySet(
  prompt: string
): Promise<{ words?: WordRow[]; error?: string }> {
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `Создай набор словарных карточек для ученика английского языка по запросу: "${prompt}"

Верни ТОЛЬКО валидный JSON-массив, без markdown, без объяснений:
[{"english":"...","russian":"...","example":"..."}]

Правила:
- english: слово или фраза на английском
- russian: перевод на русском
- example: одно живое предложение по-английски с этим словом
- 8–12 карточек если не указано иное
- Только JSON-массив`,
        },
      ],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text : "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return { error: "ИИ вернул неожиданный формат, попробуй ещё раз" };
    const words: WordRow[] = JSON.parse(match[0]);
    return { words };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function generateWordExample(
  english: string,
  russian: string
): Promise<{ example?: string; error?: string }> {
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `Придумай одно короткое живое предложение на английском со словом "${english}" (${russian}). Только предложение, без объяснений.`,
        },
      ],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    return { example: text };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function generateFillBlank(
  english: string,
  russian: string
): Promise<{ sentence?: string; error?: string }> {
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `Придумай одно предложение на английском для упражнения "вставь слово". Слово: "${english}" (${russian}).

Требования:
- Замени слово "${english}" на ___ в предложении
- Предложение должно быть понятным и естественным
- Верни ТОЛЬКО предложение с ___, без объяснений

Пример: если слово "apple" → "She ate an ___ for breakfast."`,
        },
      ],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    return { sentence: text };
  } catch (e) {
    return { error: String(e) };
  }
}
