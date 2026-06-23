"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriteAccess } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { moneyKind, optionalString, paymentMethod, requiredDecimal, requiredString } from "@/lib/form-helpers";
import { assertWeeklyPeriodOpen } from "@/lib/periods";

function optionalDateOrNow(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return new Date();
  }

  return new Date(`${text}T00:00:00.000Z`);
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
      paidAt: optionalDateOrNow(formData.get("paidAt")),
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
      paidAt: optionalDateOrNow(formData.get("paidAt")),
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
