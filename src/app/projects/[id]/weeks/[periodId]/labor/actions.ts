"use server";

import { MoneyKind } from "@prisma/client";
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

function totalFrom(formData: FormData, rate: string) {
  const total = optionalDecimal(formData.get("total"));

  if (total !== null) {
    return total;
  }

  const hours = optionalDecimal(formData.get("hours"));
  const days = optionalDecimal(formData.get("days"));
  const base = Number(hours ?? days ?? 0);

  return (base * Number(rate)).toFixed(2);
}

function weekPath(projectId: string, periodId: string) {
  return `/projects/${projectId}/weeks/${periodId}`;
}

export async function createLaborPayment(formData: FormData) {
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const rate = requiredDecimal(formData.get("rate"), "La tarifa");

  await prisma.laborPayment.create({
    data: {
      days: optionalDecimal(formData.get("days")),
      hours: optionalDecimal(formData.get("hours")),
      moneyKind: moneyKind(formData.get("moneyKind")),
      notes: optionalString(formData.get("notes")),
      rate,
      role: optionalString(formData.get("role")),
      total: totalFrom(formData, rate),
      weeklyPeriodId,
      workerName: requiredString(formData.get("workerName"), "El trabajador"),
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}

export async function updateLaborPayment(formData: FormData) {
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const id = requiredString(formData.get("id"), "El pago de nomina");
  const rate = requiredDecimal(formData.get("rate"), "La tarifa");

  await prisma.laborPayment.update({
    data: {
      days: optionalDecimal(formData.get("days")),
      hours: optionalDecimal(formData.get("hours")),
      moneyKind: moneyKind(formData.get("moneyKind")),
      notes: optionalString(formData.get("notes")),
      rate,
      role: optionalString(formData.get("role")),
      total: totalFrom(formData, rate),
      workerName: requiredString(formData.get("workerName"), "El trabajador"),
    },
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}

export async function deleteLaborPayment(formData: FormData) {
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const id = requiredString(formData.get("id"), "El pago de nomina");

  await prisma.laborPayment.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}
