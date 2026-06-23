"use server";

import { MoneyKind, PurchaseStatus } from "@prisma/client";
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

function requiredTotal(formData: FormData) {
  const total = optionalDecimal(formData.get("total"));

  if (total !== null) {
    return total;
  }

  const quantity = optionalDecimal(formData.get("quantity"));
  const unitPrice = optionalDecimal(formData.get("unitPrice"));

  if (quantity !== null && unitPrice !== null) {
    return (Number(quantity) * Number(unitPrice)).toFixed(2);
  }

  throw new Error("El total es obligatorio si no hay cantidad y precio unitario.");
}

function moneyKind(value: FormDataEntryValue | null) {
  const text = String(value ?? MoneyKind.CASH);

  if (!Object.values(MoneyKind).includes(text as MoneyKind)) {
    return MoneyKind.CASH;
  }

  return text as MoneyKind;
}

function purchaseStatus(value: FormDataEntryValue | null) {
  const text = String(value ?? PurchaseStatus.ORDERED);

  if (!Object.values(PurchaseStatus).includes(text as PurchaseStatus)) {
    return PurchaseStatus.ORDERED;
  }

  return text as PurchaseStatus;
}

async function supplierIdFromName(value: FormDataEntryValue | null) {
  const name = optionalString(value);

  if (!name) {
    return null;
  }

  const existing = await prisma.supplier.findFirst({
    select: { id: true },
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    return existing.id;
  }

  const supplier = await prisma.supplier.create({
    data: { name },
    select: { id: true },
  });

  return supplier.id;
}

function weekPath(projectId: string, periodId: string) {
  return `/projects/${projectId}/weeks/${periodId}`;
}

export async function createMaterialPurchase(formData: FormData) {
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");

  await prisma.materialPurchase.create({
    data: {
      description: requiredString(formData.get("description"), "La descripcion"),
      invoiceNumber: optionalString(formData.get("invoiceNumber")),
      moneyKind: moneyKind(formData.get("moneyKind")),
      notes: optionalString(formData.get("notes")),
      paidAmount: optionalDecimal(formData.get("paidAmount")) ?? "0",
      projectId,
      quantity: optionalDecimal(formData.get("quantity")),
      status: purchaseStatus(formData.get("status")),
      supplierId: await supplierIdFromName(formData.get("supplierName")),
      total: requiredTotal(formData),
      unit: optionalString(formData.get("unit")),
      unitPrice: optionalDecimal(formData.get("unitPrice")),
      weeklyPeriodId,
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}

export async function updateMaterialPurchase(formData: FormData) {
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const id = requiredString(formData.get("id"), "El material");

  await prisma.materialPurchase.update({
    data: {
      description: requiredString(formData.get("description"), "La descripcion"),
      invoiceNumber: optionalString(formData.get("invoiceNumber")),
      moneyKind: moneyKind(formData.get("moneyKind")),
      notes: optionalString(formData.get("notes")),
      paidAmount: optionalDecimal(formData.get("paidAmount")) ?? "0",
      quantity: optionalDecimal(formData.get("quantity")),
      status: purchaseStatus(formData.get("status")),
      supplierId: await supplierIdFromName(formData.get("supplierName")),
      total: requiredTotal(formData),
      unit: optionalString(formData.get("unit")),
      unitPrice: optionalDecimal(formData.get("unitPrice")),
    },
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}

export async function deleteMaterialPurchase(formData: FormData) {
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const id = requiredString(formData.get("id"), "El material");

  await prisma.materialPurchase.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}
