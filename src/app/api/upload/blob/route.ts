import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Не авторизован");

        return {
          maximumSizeInBytes: 200 * 1024 * 1024,
          allowedContentTypes: [
            "application/pdf",
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "audio/mpeg", "video/mp4", "text/plain",
          ],
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
