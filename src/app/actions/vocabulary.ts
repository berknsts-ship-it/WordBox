"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addVocabularySet(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const student_id = formData.get("student_id") as string;
  await supabase.from("vocabulary_sets").insert({
    student_id,
    tutor_id: user.id,
    name: formData.get("name") as string,
  });

  revalidatePath(`/tutor/students/${student_id}`);
}

export async function deleteVocabularySet(id: string, studentId: string) {
  const supabase = await createClient();
  await supabase.from("vocabulary_sets").delete().eq("id", id);
  revalidatePath(`/tutor/students/${studentId}`);
}

export async function addWord(formData: FormData) {
  const supabase = await createClient();
  const set_id = formData.get("set_id") as string;
  const student_id = formData.get("student_id") as string;
  const variantsRaw = (formData.get("answer_variants") as string) || "";
  const answer_variants = variantsRaw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  await supabase.from("vocabulary_words").insert({
    set_id,
    english: formData.get("english") as string,
    russian: formData.get("russian") as string,
    example: (formData.get("example") as string) || null,
    example_sentence: (formData.get("example_sentence") as string) || null,
    answer_variants: answer_variants.length ? answer_variants : [],
  });

  revalidatePath(`/tutor/students/${student_id}`);
}

export async function deleteWord(id: string, studentId: string) {
  const supabase = await createClient();
  await supabase.from("vocabulary_words").delete().eq("id", id);
  revalidatePath(`/tutor/students/${studentId}`);
}
