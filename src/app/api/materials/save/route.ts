import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { title, content, url, file_name, is_iframe } = await req.json();
  if (!title) return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
  if (!url && !file_name) return NextResponse.json({ error: "Нет файла или ссылки" }, { status: 400 });

  const { error } = await supabase.from("materials").insert({
    tutor_id: user.id,
    student_id: null,
    title,
    content: content || null,
    url: url || null,
    file_name: file_name || null,
    is_iframe: !!is_iframe,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/tutor/materials");
  return NextResponse.json({ ok: true });
}
