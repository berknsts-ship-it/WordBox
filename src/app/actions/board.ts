"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function saveSnapshot(studentId: string, title: string, items: unknown[], lessonId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  await supabase.from("board_snapshots").insert({
    tutor_id:   user.id,
    student_id: studentId,
    lesson_id:  lessonId ?? null,
    title:      title.trim() || new Date().toLocaleDateString("ru", { day: "numeric", month: "long", year: "numeric" }),
    items,
  });
  revalidatePath(`/tutor/board/${studentId}`);
}

export async function updateSnapshot(id: string, items: unknown[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  await supabase.from("board_snapshots")
    .update({ items, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("tutor_id", user.id);
}

export async function deleteSnapshot(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  await supabase.from("board_snapshots").delete().eq("id", id).eq("tutor_id", user.id);
}

export async function getSnapshots(studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("board_snapshots")
    .select("id, title, created_at, lesson_id, lessons(scheduled_at)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getSnapshotItems(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("board_snapshots")
    .select("items")
    .eq("id", id)
    .single();
  return (data?.items as unknown[]) ?? [];
}

export async function renameSnapshot(id: string, title: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("board_snapshots").update({ title }).eq("id", id).eq("tutor_id", user.id);
}

// Defense in depth against the load/save race that wiped real board content:
// an empty save is only allowed through if the caller explicitly confirms it
// (the tutor pressed "clear board"). Anything else that would overwrite a
// non-empty board with an empty one — a bug, a slow/failed load, a stray
// timer — gets refused instead of silently destroying real work.
export async function saveBoardState(studentId: string, items: unknown[], opts?: { allowClear?: boolean }) {
  const db = createAdminClient();
  if (items.length === 0 && !opts?.allowClear) {
    const { data: existing } = await db.from("boards").select("data").eq("student_id", studentId).maybeSingle();
    const existingItems = (existing?.data as { items?: unknown[] } | null)?.items ?? [];
    if (existingItems.length > 0) {
      console.warn(`[board] refused to overwrite non-empty board (student ${studentId}) with an empty save`);
      return { skipped: true };
    }
  }
  await db.from("boards").upsert(
    { student_id: studentId, data: { items }, updated_at: new Date().toISOString() },
    { onConflict: "student_id" }
  );
  return { skipped: false };
}

export async function loadBoardState(studentId: string): Promise<{ items: unknown[]; error: boolean }> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("boards")
    .select("data")
    .eq("student_id", studentId)
    .single();
  // PGRST116 = no row yet (brand-new student, board never saved) — a
  // legitimate empty state, not a failure. Any other error means we don't
  // actually know the real board state, so the caller must not treat it as
  // "confirmed empty" (that's exactly what let a slow/failed load arm an
  // autosave that overwrote real content).
  if (error && error.code !== "PGRST116") {
    return { items: [], error: true };
  }
  return { items: (data?.data as { items: unknown[] } | null)?.items ?? [], error: false };
}

export interface BoardMaterial { id: string; title: string; file_url: string | null; file_name: string | null; }

export async function getMaterialsForBoard(): Promise<BoardMaterial[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const db = createAdminClient();
  // In WordBox the column is "url", not "file_url" — map it for WhiteboardCanvas compatibility
  const { data } = await db
    .from("materials")
    .select("id, title, url, file_name")
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? []).map((m: { id: string; title: string; url: string | null; file_name: string | null }) => ({
    id:       m.id,
    title:    m.title,
    file_url: m.url,
    file_name: m.file_name,
  }));
}
