"use server";

export async function createUploadUrl(
  path: string
): Promise<{ url: string | null; debug: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { url: null, debug: `НЕТ ПЕРЕМЕННЫХ: url=${!!supabaseUrl} key=${!!serviceRoleKey}` };
  }

  // Прямой HTTP запрос к Supabase Storage REST API (минуя SDK)
  const storageEndpoint = `${supabaseUrl}/storage/v1/object/upload/sign/WordBox/${path}`;

  const res = await fetch(storageEndpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${serviceRoleKey}`,
      "apikey": serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: 3600 }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { url: null, debug: `HTTP ${res.status}: ${text} | URL: ${supabaseUrl}` };
  }

  const data = await res.json();

  if (!data.url) {
    return { url: null, debug: `Нет поля url в ответе: ${JSON.stringify(data)}` };
  }

  // data.url это путь вида /storage/v1/object/upload/sign/... — делаем полный URL
  const fullSignedUrl = data.url.startsWith("http")
    ? data.url
    : `${supabaseUrl}${data.url}`;

  return { url: fullSignedUrl, debug: "ok" };
}
