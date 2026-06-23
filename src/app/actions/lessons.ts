"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addLesson(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const student_id = formData.get("student_id") as string;
  await supabase.from("lessons").insert({
    student_id,
    tutor_id: user.id,
    date: formData.get("date") as string,
    duration_minutes: Number(formData.get("duration_minutes")) || 60,
    topic: (formData.get("topic") as string) || null,
    notes: (formData.get("notes") as string) || null,
    status: (formData.get("status") as string) || "scheduled",
  });

  revalidatePath(`/tutor/students/${student_id}`);
  revalidatePath("/tutor/schedule");
}

export async function updateLessonStatus(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const studentId = formData.get("studentId") as string;

  await supabase.from("lessons").update({ status }).eq("id", id);
  revalidatePath(`/tutor/students/${studentId}`);
  revalidatePath("/tutor/schedule");
}

export async function deleteLesson(id: string, studentId: string) {
  const supabase = await createClient();
  await supabase.from("lessons").delete().eq("id", id);
  revalidatePath(`/tutor/students/${studentId}`);
  revalidatePath("/tutor/schedule");
}

export async function markLessonCompleted(id: string, studentId: string) {
  const supabase = await createClient();
  await supabase.from("lessons").update({ status: "completed" }).eq("id", id);
  revalidatePath(`/tutor/students/${studentId}`);
  revalidatePath("/tutor/schedule");
}
