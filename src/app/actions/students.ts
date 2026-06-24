"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function generateCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  let code = "";
  for (let i = 0; i < 3; i++) code += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 3; i++) code += digits[Math.floor(Math.random() * digits.length)];
  return code;
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
  const textbook = (formData.get("textbook") as string) || null;
  await supabase.from("students").update({ textbook }).eq("id", id);
  revalidatePath(`/tutor/students/${id}`);
}

export async function deleteStudent(id: string) {
  const supabase = await createClient();
  await supabase.from("students").delete().eq("id", id);
  revalidatePath("/tutor/students");
  redirect("/tutor/students");
}
