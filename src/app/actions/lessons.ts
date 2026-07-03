"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateLessonStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  // Списываем с абонемента при проведении или сгорании урока
  if (status === "completed" || status === "missed") {
    const db = createAdminClient();
    const { data: lesson } = await db.from("lessons")
      .select("subscription_id, price_rub, deducted_amount")
      .eq("id", id)
      .single();

    if (lesson?.subscription_id && lesson?.price_rub && !lesson?.deducted_amount) {
      await db.from("lessons").update({ deducted_amount: lesson.price_rub }).eq("id", id);
      await db.rpc("subscription_deduct", { p_id: lesson.subscription_id, p_amount: lesson.price_rub });
      revalidatePath("/tutor/students");
    }
  }

  revalidatePath("/tutor/schedule");
}

export async function rescheduleLesson(id: string, rescheduledTo: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons")
    .update({ status: "rescheduled", rescheduled_to: rescheduledTo })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/tutor/schedule");
}

export async function updateLesson(id: string, fields: {
  scheduled_at?: string;
  duration_min?: number;
  price_rub?: number | null;
  notes?: string | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").update(fields).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/tutor/schedule");
  revalidatePath("/tutor/students");
}

export async function deleteLesson(id: string, studentId?: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) return { error: error.message };
  if (studentId) revalidatePath(`/tutor/students/${studentId}`);
  revalidatePath("/tutor/schedule");
  revalidatePath("/tutor/students");
  revalidatePath("/tutor/dashboard");
}

// ── wordbox-specific (used by components/tutor/LessonCard, LessonsTab) ────────

export async function addLesson(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const student_id = formData.get("student_id") as string;
  const priceRaw   = formData.get("price_rub");
  await supabase.from("lessons").insert({
    student_id,
    tutor_id:     user.id,
    scheduled_at: formData.get("date") as string,
    notes:        (formData.get("notes") as string) || null,
    status:       (formData.get("status") as string) || "scheduled",
    price_rub:    priceRaw ? Number(priceRaw) : null,
  });
  revalidatePath(`/tutor/students/${student_id}`);
  revalidatePath("/tutor/schedule");
}

export async function updateLessonStatusForm(formData: FormData) {
  const supabase  = await createClient();
  const id        = formData.get("id") as string;
  const status    = formData.get("status") as string;
  const studentId = formData.get("studentId") as string;
  await supabase.from("lessons").update({ status }).eq("id", id);
  if (studentId) revalidatePath(`/tutor/students/${studentId}`);
  revalidatePath("/tutor/schedule");
}

export async function updateLessonForm(formData: FormData) {
  const supabase  = await createClient();
  const id        = formData.get("id") as string;
  const studentId = formData.get("student_id") as string;
  const priceRaw  = formData.get("price_rub");
  await supabase.from("lessons").update({
    scheduled_at:   formData.get("date") as string,
    notes:          (formData.get("notes") as string) || null,
    price_rub:      priceRaw ? Number(priceRaw) : null,
    payment_status: formData.get("payment_status") as string,
    status:         formData.get("status") as string,
  }).eq("id", id);
  if (studentId) revalidatePath(`/tutor/students/${studentId}`);
  revalidatePath("/tutor/schedule");
  revalidatePath("/tutor/dashboard");
}

export async function markLessonCompleted(id: string, studentId: string) {
  const supabase = await createClient();
  await supabase.from("lessons").update({ status: "completed" }).eq("id", id);
  revalidatePath(`/tutor/students/${studentId}`);
  revalidatePath("/tutor/schedule");
}

export async function togglePaymentStatus(id: string, current: "paid" | "unpaid") {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons")
    .update({ payment_status: current === "paid" ? "unpaid" : "paid" })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/tutor/schedule");
  revalidatePath("/tutor/students");
  revalidatePath("/tutor/dashboard");
}
