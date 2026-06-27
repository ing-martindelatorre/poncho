"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriteAccess } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { moneyKind, optionalDecimal, optionalString, requiredDecimal, requiredString } from "@/lib/form-helpers";
import { assertWeeklyPeriodOpen } from "@/lib/periods";

function totalFrom(volume: string, unitPrice: string) {
  return (Number(volume) * Number(unitPrice)).toFixed(2);
}

function weekPath(projectId: string, periodId: string) {
  return `/projects/${projectId}/weeks/${periodId}`;
}

export async function createWorkItem(formData: FormData) {
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const volume = requiredDecimal(formData.get("volume"), "El volumen");
  const unitPrice = requiredDecimal(formData.get("unitPrice"), "El precio unitario");
  await assertWeeklyPeriodOpen(weeklyPeriodId);

  await prisma.workItem.create({
    data: {
      category: requiredString(formData.get("category"), "La categoria"),
      description: requiredString(formData.get("description"), "La descripcion"),
      height: optionalDecimal(formData.get("height")),
      length: optionalDecimal(formData.get("length")),
      moneyKind: moneyKind(formData.get("moneyKind")),
      notes: optionalString(formData.get("notes")),
      pieces: optionalDecimal(formData.get("pieces")),
      total: totalFrom(volume, unitPrice),
      unit: requiredString(formData.get("unit"), "La unidad"),
      unitPrice,
      volume,
      weeklyPeriodId,
      width: optionalDecimal(formData.get("width")),
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}

export async function updateWorkItem(formData: FormData) {
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const id = requiredString(formData.get("id"), "El destajo");
  const volume = requiredDecimal(formData.get("volume"), "El volumen");
  const unitPrice = requiredDecimal(formData.get("unitPrice"), "El precio unitario");
  await assertWeeklyPeriodOpen(weeklyPeriodId);

  await prisma.workItem.update({
    data: {
      category: requiredString(formData.get("category"), "La categoria"),
      description: requiredString(formData.get("description"), "La descripcion"),
      height: optionalDecimal(formData.get("height")),
      length: optionalDecimal(formData.get("length")),
      moneyKind: moneyKind(formData.get("moneyKind")),
      notes: optionalString(formData.get("notes")),
      pieces: optionalDecimal(formData.get("pieces")),
      total: totalFrom(volume, unitPrice),
      unit: requiredString(formData.get("unit"), "La unidad"),
      unitPrice,
      volume,
      width: optionalDecimal(formData.get("width")),
    },
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}

export async function deleteWorkItem(formData: FormData) {
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const id = requiredString(formData.get("id"), "El destajo");
  await assertWeeklyPeriodOpen(weeklyPeriodId);

  await prisma.workItem.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}
