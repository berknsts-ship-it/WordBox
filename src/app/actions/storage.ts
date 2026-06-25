"use server";

import { createClient } from "@supabase/supabase-js";

export async function createUploadUrl(
  path: string
): Promise<{ url: string | null; debug: string }> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return { url: null, debug: "НЕТ_КЛЮЧА: SUPABASE_SERVICE_ROLE_KEY не задан в Vercel" };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase.storage
    .from("WordBox")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return { url: null, debug: `ОШИБКА_STORAGE: ${JSON.stringify(error)}` };
  }

  return { url: data.signedUrl, debug: "ok" };
}
