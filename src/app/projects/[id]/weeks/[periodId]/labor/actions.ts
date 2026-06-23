"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriteAccess } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { moneyKind, optionalDecimal, optionalString, requiredDecimal, requiredString } from "@/lib/form-helpers";
import { assertWeeklyPeriodOpen } from "@/lib/periods";

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
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const rate = requiredDecimal(formData.get("rate"), "La tarifa");
  await assertWeeklyPeriodOpen(weeklyPeriodId);

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
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const id = requiredString(formData.get("id"), "El pago de nomina");
  const rate = requiredDecimal(formData.get("rate"), "La tarifa");
  await assertWeeklyPeriodOpen(weeklyPeriodId);

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
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const id = requiredString(formData.get("id"), "El pago de nomina");
  await assertWeeklyPeriodOpen(weeklyPeriodId);

  await prisma.laborPayment.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(weekPath(projectId, weeklyPeriodId));
  redirect(weekPath(projectId, weeklyPeriodId));
}
