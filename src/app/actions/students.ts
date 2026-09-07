"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { slugifyTextbookName } from "@/lib/textbookSlug";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// The textbook field is one dropdown, but three separate systems key off it
// today: the static grammar reference (GrammarTab, matched purely by string —
// unaffected by this), the vocabulary/trainer library, and (deliberately not
// touched here) the grammar exercise library, which she wants to keep
// assigned by hand per student regardless of textbook. This closes the vocab
// side: picking a textbook auto-assigns that textbook's vocabulary sets. It
// only ever adds — switching textbooks later never un-assigns the old sets,
// so nothing already given to a student disappears.
//
// The textbook code is just slugify(folder name) — no hardcoded name map to
// maintain. A brand-new vocabulary folder becomes selectable the moment it's
// created, with no code change; only its grammar reference page (GrammarTab)
// still needs to be written by hand, since that's real authored content.
async function assignTextbookVocab(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  tutorId: string,
  textbook: string | null
) {
  if (!textbook) return;
  const { data: folders } = await supabase.from("vocabulary_folders").select("id, name").eq("tutor_id", tutorId);
  const folder = (folders ?? []).find(f => slugifyTextbookName(f.name) === textbook);
  if (!folder) return;

  const { data: sets } = await supabase.from("vocabulary_sets").select("id").eq("folder_id", folder.id);
  if (!sets || sets.length === 0) return;

  const { data: existing } = await supabase.from("set_assignments")
    .select("set_id").eq("student_id", studentId).in("set_id", sets.map(s => s.id));
  const existingIds = new Set((existing ?? []).map(r => r.set_id));

  const toInsert = sets.filter(s => !existingIds.has(s.id)).map(s => ({ set_id: s.id, student_id: studentId }));
  if (toInsert.length > 0) await supabase.from("set_assignments").insert(toInsert);
}

export async function createStudent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const name = (formData.get("name") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;
  if (!name) return { error: "Введите имя ученика" };

  let access_code = generateCode();
  // ensure uniqueness
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase.from("students").select("id").eq("access_code", access_code).single();
    if (!data) break;
    access_code = generateCode();
  }

  const { error } = await supabase.from("students").insert({
    tutor_id: user.id,
    name,
    notes,
    access_code,
  });

  if (error) return { error: error.message };
  revalidatePath("/tutor/students");
  redirect("/tutor/students");
}

export async function addStudent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const email = (formData.get("email") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const access_code = generateCode();
  const textbook = (formData.get("textbook") as string) || null;

  const { data, error } = await supabase
    .from("students")
    .insert({ name, email, notes, access_code, tutor_id: user.id, textbook })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  await assignTextbookVocab(supabase, data.id, user.id, textbook);
  redirect(`/tutor/students/${data.id}`);
}

export async function updateCanvasUrl(id: string, formData: FormData) {
  const supabase = await createClient();
  const canvas_url = (formData.get("canvas_url") as string) || null;
  await supabase.from("students").update({ canvas_url }).eq("id", id);
  revalidatePath(`/tutor/students/${id}`);
}

export async function updateTextbook(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const textbook = (formData.get("textbook") as string) || null;
  await supabase.from("students").update({ textbook }).eq("id", id);
  await assignTextbookVocab(supabase, id, user.id, textbook);
  revalidatePath(`/tutor/students/${id}`);
}

export async function deleteStudent(id: string) {
  const supabase = await createClient();
  await supabase.from("students").delete().eq("id", id);
  revalidatePath("/tutor/students");
  redirect("/tutor/students");
}
