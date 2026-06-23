"use server";

import { MoneyKind, PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriteAccess } from "@/lib/authz";
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

function requiredDecimal(value: FormDataEntryValue | null, fieldName: string) {
  const text = String(value ?? "").trim().replace(",", ".");
  const number = Number(text);

  if (!text || !Number.isFinite(number) || number < 0) {
    throw new Error(`${fieldName} no es valido.`);
  }

  return text;
}

function optionalDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return new Date();
  }

  return new Date(`${text}T00:00:00.000Z`);
}

function moneyKind(value: FormDataEntryValue | null) {
  const text = String(value ?? MoneyKind.CASH);

  if (!Object.values(MoneyKind).includes(text as MoneyKind)) {
    return MoneyKind.CASH;
  }

  return text as MoneyKind;
}

function paymentMethod(value: FormDataEntryValue | null) {
  const text = String(value ?? PaymentMethod.TRANSFER);

  if (!Object.values(PaymentMethod).includes(text as PaymentMethod)) {
    return PaymentMethod.TRANSFER;
  }

  return text as PaymentMethod;
}

function weekPath(projectId: string, periodId: string) {
  return `/projects/${projectId}/weeks/${periodId}`;
}

export async function createPayment(formData: FormData) {
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  await assertWeeklyPeriodOpen(weeklyPeriodId);

  await prisma.payment.create({
    data: {
      amount: requiredDecimal(formData.get("amount"), "El monto"),
      description: requiredString(formData.get("description"), "La descripcion"),
      method: paymentMethod(formData.get("method")),
      moneyKind: moneyKind(formData.get("moneyKind")),
      notes: optionalString(formData.get("notes")),
      paidAt: optionalDate(formData.get("paidAt")),
      targetId: weeklyPeriodId,
      targetType: "weekly_period",
      weeklyPeriodId,
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}

export async function updatePayment(formData: FormData) {
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const id = requiredString(formData.get("id"), "El pago");
  await assertWeeklyPeriodOpen(weeklyPeriodId);

  await prisma.payment.update({
    data: {
      amount: requiredDecimal(formData.get("amount"), "El monto"),
      description: requiredString(formData.get("description"), "La descripcion"),
      method: paymentMethod(formData.get("method")),
      moneyKind: moneyKind(formData.get("moneyKind")),
      notes: optionalString(formData.get("notes")),
      paidAt: optionalDate(formData.get("paidAt")),
    },
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}

export async function deletePayment(formData: FormData) {
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const id = requiredString(formData.get("id"), "El pago");
  await assertWeeklyPeriodOpen(weeklyPeriodId);

  await prisma.payment.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}
