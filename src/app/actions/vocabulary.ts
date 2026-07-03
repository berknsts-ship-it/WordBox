"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addVocabularySet(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const name = formData.get("name") as string;
  const student_id = (formData.get("student_id") as string) || null;

  const { data: newSet } = await supabase
    .from("vocabulary_sets")
    .insert({ tutor_id: user.id, name, student_id })
    .select("id")
    .single();

  // If a student was selected, immediately assign the set
  if (newSet && student_id) {
    await supabase
      .from("set_assignments")
      .upsert({ set_id: newSet.id, student_id }, { onConflict: "set_id,student_id" });
  }

  revalidatePath("/tutor/vocabulary");
}

export async function deleteVocabularySet(id: string) {
  const supabase = await createClient();
  await supabase.from("vocabulary_sets").delete().eq("id", id);
  revalidatePath("/tutor/vocabulary");
}

export async function setVocabularyAssignments(setId: string, studentIds: string[]) {
  const supabase = await createClient();
  // Replace all assignments for this set
  await supabase.from("set_assignments").delete().eq("set_id", setId);
  if (studentIds.length > 0) {
    await supabase
      .from("set_assignments")
      .insert(studentIds.map((sid) => ({ set_id: setId, student_id: sid })));
  }
  revalidatePath("/tutor/vocabulary");
}

export async function addWord(formData: FormData) {
  const supabase = await createClient();
  const set_id = formData.get("set_id") as string;
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

  revalidatePath(`/tutor/vocabulary/${set_id}`);
}

export async function deleteWord(id: string, setId: string) {
  const supabase = await createClient();
  await supabase.from("vocabulary_words").delete().eq("id", id);
  revalidatePath(`/tutor/vocabulary/${setId}`);
}
