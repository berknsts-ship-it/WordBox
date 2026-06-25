import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const folder = formData.get("folder") as string;

  if (!file || !folder) {
    return NextResponse.json({ error: "Missing file or folder" }, { status: 400 });
  }

  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}.${ext}`;

  const blob = await put(path, file, { access: "public" });

  return NextResponse.json({ url: blob.url, name: file.name });
}
