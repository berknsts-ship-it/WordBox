"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addMaterial(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const student_id = formData.get("student_id") as string;
  await supabase.from("materials").insert({
    student_id,
    tutor_id: user.id,
    title: formData.get("title") as string,
    content: (formData.get("content") as string) || null,
    url: (formData.get("url") as string) || null,
    is_iframe: formData.get("is_iframe") === "on",
  });

  revalidatePath(`/tutor/students/${student_id}`);
}

export async function deleteMaterial(id: string, studentId: string) {
  const supabase = await createClient();
  await supabase.from("materials").delete().eq("id", id);
  revalidatePath(`/tutor/students/${studentId}`);
}
