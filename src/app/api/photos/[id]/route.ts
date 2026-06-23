import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type PhotoRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: PhotoRouteProps) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({
    where: { id },
  });

  if (!photo) {
    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
  }

  try {
    const bytes = await fs.readFile(photo.storagePath);

    return new Response(bytes, {
      headers: {
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": `inline; filename="${photo.fileName}"`,
        "Content-Type": photo.mimeType,
      },
    });
  } catch {
    return NextResponse.json({ error: "Archivo no disponible" }, { status: 404 });
  }
}
