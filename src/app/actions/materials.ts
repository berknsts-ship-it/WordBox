"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addMaterial(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const student_id = formData.get("student_id") as string;

  let url: string | null = (formData.get("url") as string) || null;
  let file_name: string | null = null;

  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop();
    const path = `materials/${user.id}/${Date.now()}.${ext}`;
    const { data: uploadData } = await supabase.storage
      .from("WordBox")
      .upload(path, file);

    if (uploadData) {
      const { data: urlData } = supabase.storage
        .from("WordBox")
        .getPublicUrl(uploadData.path);
      url = urlData.publicUrl;
      file_name = file.name;
    }
  }

  await supabase.from("materials").insert({
    student_id,
    tutor_id: user.id,
    title: formData.get("title") as string,
    content: (formData.get("content") as string) || null,
    url,
    file_name,
    is_iframe: formData.get("is_iframe") === "on",
  });

  revalidatePath(`/tutor/students/${student_id}`);
}

export async function deleteMaterial(id: string, studentId: string) {
  const supabase = await createClient();
  await supabase.from("materials").delete().eq("id", id);
  revalidatePath(`/tutor/students/${studentId}`);
}
