import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "/var/www/uploads";
const SITE_URL = process.env.SITE_URL ?? "https://word-box.ru";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const folder = (formData.get("folder") as string) || "misc";

  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

  const ext = file.name.split(".").pop();
  const filePath = `${folder}/${Date.now()}.${ext}`;
  const fullPath = path.join(UPLOAD_DIR, filePath);

  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `${SITE_URL}/uploads/${filePath}`, name: file.name });
}
