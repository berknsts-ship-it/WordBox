import { NextRequest, NextResponse } from "next/server";
import { verifyUploadToken } from "@/lib/upload-token";
import { mkdir, unlink, stat } from "fs/promises";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import nodePath from "path";

export const runtime = "nodejs";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "/var/www/uploads";

export async function PUT(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

  const payload = verifyUploadToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });

  const { uploadPath } = payload;
  const filePath = nodePath.resolve(UPLOAD_DIR, uploadPath);

  if (!filePath.startsWith(nodePath.resolve(UPLOAD_DIR))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  await mkdir(nodePath.dirname(filePath), { recursive: true });

  if (!req.body) return NextResponse.json({ error: "No body" }, { status: 400 });

  // A dropped connection mid-upload ends the readable stream cleanly from
  // Node's point of view — pipeline() resolves normally and a truncated
  // file gets written silently. Compare against the browser-declared
  // Content-Length so an interrupted upload fails loudly instead.
  const declaredLength = req.headers.get("content-length");
  const expectedBytes = declaredLength ? parseInt(declaredLength, 10) : null;

  const writable = createWriteStream(filePath);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await pipeline(Readable.fromWeb(req.body as any), writable);

  if (expectedBytes !== null) {
    const { size: actualBytes } = await stat(filePath);
    if (actualBytes !== expectedBytes) {
      await unlink(filePath).catch(() => {});
      return NextResponse.json(
        { error: `Загрузка прервалась (получено ${actualBytes} из ${expectedBytes} байт). Попробуйте ещё раз.` },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
