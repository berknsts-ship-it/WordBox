"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function createUploadUrl(path: string): Promise<string | null> {
  const serverSupabase = await createServerClient();
  const { data: { session } } = await serverSupabase.auth.getSession();
  if (!session) {
    const { data: { user } } = await serverSupabase.auth.getUser().catch(() => ({ data: { user: null } }));
    if (!user) {
      console.error("[storage] нет сессии и пользователя");
    }
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error("[storage] SUPABASE_SERVICE_ROLE_KEY не задан");
    return null;
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  );

  const { data, error } = await adminSupabase.storage
    .from("WordBox")
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("[storage] createSignedUploadUrl error:", error);
    return null;
  }

  return data.signedUrl;
}
