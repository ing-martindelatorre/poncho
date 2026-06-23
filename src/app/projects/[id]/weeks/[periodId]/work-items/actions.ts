"use server";

import { MoneyKind } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertWeeklyPeriodOpen } from "@/lib/periods";

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function requiredString(value: FormDataEntryValue | null, fieldName: string) {
  const text = optionalString(value);

  if (!text) {
    throw new Error(`${fieldName} es obligatorio.`);
  }

  return text;
}

function optionalDecimal(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const normalized = text.replace(",", ".");
  const number = Number(normalized);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error("El valor numerico no es valido.");
  }

  return normalized;
}

function requiredDecimal(value: FormDataEntryValue | null, fieldName: string) {
  const decimal = optionalDecimal(value);

  if (decimal === null) {
    throw new Error(`${fieldName} es obligatorio.`);
  }

  return decimal;
}

function moneyKind(value: FormDataEntryValue | null) {
  const text = String(value ?? MoneyKind.CASH);

  if (!Object.values(MoneyKind).includes(text as MoneyKind)) {
    return MoneyKind.CASH;
  }

  return text as MoneyKind;
}

function totalFrom(volume: string, unitPrice: string) {
  return (Number(volume) * Number(unitPrice)).toFixed(2);
}

function weekPath(projectId: string, periodId: string) {
  return `/projects/${projectId}/weeks/${periodId}`;
}

export async function createWorkItem(formData: FormData) {
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
