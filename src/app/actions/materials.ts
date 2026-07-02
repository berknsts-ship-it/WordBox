"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteMaterial(id: string) {
  const supabase = await createClient();
  await supabase.from("materials").delete().eq("id", id);
  revalidatePath("/tutor/materials");
  revalidatePath("/tutor/students");
}

export async function setMaterialAssignments(materialId: string, studentIds: string[]) {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const admin = createAdminClient();
  const { data: mat } = await admin.from("materials").select("tutor_id").eq("id", materialId).single();
  if (!mat || mat.tutor_id !== user.id) return { error: "Нет доступа" };

  await admin.from("material_assignments").delete().eq("material_id", materialId);
  if (studentIds.length > 0) {
    const { error } = await admin.from("material_assignments").insert(
      studentIds.map(sid => ({ material_id: materialId, student_id: sid }))
    );
    if (error) return { error: error.message };
  }

  revalidatePath("/tutor/materials");
  revalidatePath("/tutor/students");
  return { ok: true };
}

export async function setStudentMaterials(studentId: string, materialIds: string[]) {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const admin = createAdminClient();
  await admin.from("material_assignments").delete().eq("student_id", studentId);
  if (materialIds.length > 0) {
    const { error } = await admin.from("material_assignments").insert(
      materialIds.map(mid => ({ material_id: mid, student_id: studentId }))
    );
    if (error) return { error: error.message };
  }

  revalidatePath(`/tutor/students/${studentId}`);
  revalidatePath("/tutor/materials");
  return { ok: true };
}
