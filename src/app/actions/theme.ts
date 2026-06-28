"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ThemeId } from "@/components/student/themes";

export async function saveStudentTheme(studentId: string, theme: ThemeId) {
  const supabase = await createClient();
  await supabase
    .from("students")
    .update({ theme })
    .eq("id", studentId);
  revalidatePath(`/student`);
}
