"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addHomework(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const student_id = formData.get("student_id") as string;
  await supabase.from("homework").insert({
    student_id,
    tutor_id: user.id,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    due_date: (formData.get("due_date") as string) || null,
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
