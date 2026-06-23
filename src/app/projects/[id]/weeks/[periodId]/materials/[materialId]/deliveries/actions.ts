"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

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

function requiredDate(value: FormDataEntryValue | null, fieldName: string) {
  const text = requiredString(value, fieldName);
  return new Date(`${text}T00:00:00.000Z`);
}

function materialPath(projectId: string, periodId: string, materialId: string) {
  return `/projects/${projectId}/weeks/${periodId}/materials/${materialId}`;
}

export async function createMaterialDelivery(formData: FormData) {
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const materialPurchaseId = requiredString(formData.get("materialPurchaseId"), "El material");

  await prisma.materialDelivery.create({
    data: {
      deliveryDate: requiredDate(formData.get("deliveryDate"), "La fecha"),
      materialPurchaseId,
      notes: optionalString(formData.get("notes")),
      quantity: optionalDecimal(formData.get("quantity")),
      weeklyPeriodId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/weeks/${weeklyPeriodId}`);
  revalidatePath(materialPath(projectId, weeklyPeriodId, materialPurchaseId));
  redirect(materialPath(projectId, weeklyPeriodId, materialPurchaseId));
}

export async function deleteMaterialDelivery(formData: FormData) {
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const materialPurchaseId = requiredString(formData.get("materialPurchaseId"), "El material");
  const id = requiredString(formData.get("id"), "La entrega");

  await prisma.materialDelivery.delete({
    where: { id },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/weeks/${weeklyPeriodId}`);
  revalidatePath(materialPath(projectId, weeklyPeriodId, materialPurchaseId));
  redirect(materialPath(projectId, weeklyPeriodId, materialPurchaseId));
}
