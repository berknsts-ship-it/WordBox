"use server";

import { createClient } from "@/lib/supabase/server";

export async function createUploadUrl(path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.storage
    .from("WordBox")
    .createSignedUploadUrl(path);

  if (error || !data) return null;
  return data.signedUrl;
}
