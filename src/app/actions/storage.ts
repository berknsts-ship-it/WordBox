"use server";

import { createClient } from "@supabase/supabase-js";

export async function createUploadUrl(path: string): Promise<string | null> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error("[storage] SUPABASE_SERVICE_ROLE_KEY не задан в переменных окружения");
    return null;
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
    console.error("[storage] ошибка createSignedUploadUrl:", JSON.stringify(error));
    return null;
  }

  return data.signedUrl;
}
