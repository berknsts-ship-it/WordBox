import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<Response> {
  // Auth check before handleUpload consumes the request
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        maximumSizeInBytes: 200 * 1024 * 1024,
        allowedContentTypes: [
          "application/pdf",
          "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "audio/mpeg", "video/mp4", "text/plain",
        ],
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
