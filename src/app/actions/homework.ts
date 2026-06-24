"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addHomework(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const student_id = formData.get("student_id") as string;
  const uploadedUrl = (formData.get("uploaded_url") as string) || null;
  const uploadedFileName = (formData.get("uploaded_file_name") as string) || null;
  const textUrl = (formData.get("material_url") as string) || null;
  const textLabel = (formData.get("material_label") as string) || null;

  await supabase.from("homework").insert({
    student_id,
    tutor_id: user.id,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    due_date: (formData.get("due_date") as string) || null,
    material_url: uploadedUrl || textUrl,
    material_label: uploadedFileName || textLabel,
    status: "pending",
  });

  revalidatePath(`/tutor/students/${student_id}`);
}

export async function updateHomeworkStatus(id: string, status: string, studentId: string) {
  const supabase = await createClient();
  await supabase.from("homework").update({ status }).eq("id", id);
  revalidatePath(`/tutor/students/${studentId}`);
}

export async function deleteHomework(id: string, studentId: string) {
  const supabase = await createClient();
  await supabase.from("homework").delete().eq("id", id);
  revalidatePath(`/tutor/students/${studentId}`);
}
