"use server";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { PhotoLinkType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriteAccess } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { optionalString, requiredString } from "@/lib/form-helpers";
import { assertWeeklyPeriodOpen } from "@/lib/periods";
import { extensionFromMime, safeJoinUploadPath } from "@/lib/uploads";

function weekPath(projectId: string, periodId: string) {
  return `/projects/${projectId}/weeks/${periodId}`;
}

export async function createPhoto(formData: FormData) {
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const file = formData.get("photo");
  await assertWeeklyPeriodOpen(weeklyPeriodId);

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("La foto es obligatoria.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten imagenes.");
  }

  const extension = extensionFromMime(file.type) || path.extname(file.name);
  const fileName = `${crypto.randomUUID()}${extension}`;
  const folder = safeJoinUploadPath(projectId, weeklyPeriodId);
  const storagePath = safeJoinUploadPath(projectId, weeklyPeriodId, fileName);

  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(storagePath, Buffer.from(await file.arrayBuffer()));

  await prisma.photo.create({
    data: {
      caption: optionalString(formData.get("caption")),
      fileName: file.name,
      linkId: weeklyPeriodId,
      linkType: PhotoLinkType.WEEKLY_PERIOD,
      mimeType: file.type,
      projectId,
      sizeBytes: file.size,
      storagePath,
      weeklyPeriodId,
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}

export async function deletePhoto(formData: FormData) {
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const id = requiredString(formData.get("id"), "La foto");
  await assertWeeklyPeriodOpen(weeklyPeriodId);

  const photo = await prisma.photo.delete({
    where: { id },
  });

  await fs.unlink(photo.storagePath).catch(() => undefined);

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}
