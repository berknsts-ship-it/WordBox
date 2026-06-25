"use server";

import { createClient } from "@/lib/supabase/server";

export async function createUploadUrl(
  path: string
): Promise<{ url: string | null; debug: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Получаем access_token пользователя из cookies (это нормальный JWT)
  const supabase = await createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {
      url: null,
      debug: `НЕТ_СЕССИИ: ${sessionError?.message ?? "session is null"}`,
    };
  }

  const accessToken = session.access_token;

  // Прямой REST запрос к Supabase Storage с JWT пользователя
  const storageEndpoint = `${supabaseUrl}/storage/v1/object/upload/sign/WordBox/${path}`;

  const res = await fetch(storageEndpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: 3600 }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { url: null, debug: `HTTP ${res.status}: ${text}` };
  }

  const data = await res.json();

  const signedUrl = data.url?.startsWith("http")
    ? data.url
    : `${supabaseUrl}${data.url}`;

  return { url: signedUrl, debug: "ok" };
}
