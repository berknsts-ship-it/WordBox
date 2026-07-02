import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { fileName, contentType } = await req.json();
  if (!fileName) return NextResponse.json({ error: "fileName required" }, { status: 400 });

  const ext = fileName.split(".").pop();
  const storagePath = `${user.id}/${Date.now()}.${ext}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Прямой REST вызов к Supabase Storage API
  const res = await fetch(
    `${supabaseUrl}/storage/v1/object/upload/sign/materials/${storagePath}`,
    {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  const result = await res.json();
  if (!res.ok) {
    return NextResponse.json(
      { error: result.error ?? result.message ?? `Storage error ${res.status}` },
      { status: 500 }
    );
  }

  // Supabase возвращает path (/storage/v1/object/upload/sign/...)
  const signedUrl = result.url.startsWith("http")
    ? result.url
    : `${supabaseUrl}${result.url}`;

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/materials/${storagePath}`;

  return NextResponse.json({ signedUrl, publicUrl, path: storagePath });
}
