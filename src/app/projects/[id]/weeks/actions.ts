"use server";

import { PeriodStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriteAccess } from "@/lib/authz";
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

function requiredInteger(value: FormDataEntryValue | null, fieldName: string) {
  const number = Number(String(value ?? "").trim());

  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${fieldName} no es valido.`);
  }

  return number;
}

function requiredDate(value: FormDataEntryValue | null, fieldName: string) {
  const text = requiredString(value, fieldName);
  return new Date(`${text}T00:00:00.000Z`);
}

function periodStatus(value: FormDataEntryValue | null) {
  const text = String(value ?? PeriodStatus.OPEN);

  if (!Object.values(PeriodStatus).includes(text as PeriodStatus)) {
    return PeriodStatus.OPEN;
  }

  return text as PeriodStatus;
}

export async function createWeeklyPeriod(formData: FormData) {
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");

  const period = await prisma.weeklyPeriod.create({
    data: {
      endDate: requiredDate(formData.get("endDate"), "La fecha final"),
      label: requiredString(formData.get("label"), "La etiqueta de semana"),
      notes: optionalString(formData.get("notes")),
      projectId,
      startDate: requiredDate(formData.get("startDate"), "La fecha inicial"),
      status: periodStatus(formData.get("status")),
      weekNumber: requiredInteger(formData.get("weekNumber"), "El numero de semana"),
    },
    select: { id: true },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}/weeks/${period.id}`);
}

export async function updateWeeklyPeriod(formData: FormData) {
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const id = requiredString(formData.get("id"), "La semana");

  await prisma.weeklyPeriod.update({
    data: {
      endDate: requiredDate(formData.get("endDate"), "La fecha final"),
      label: requiredString(formData.get("label"), "La etiqueta de semana"),
      notes: optionalString(formData.get("notes")),
      startDate: requiredDate(formData.get("startDate"), "La fecha inicial"),
      status: periodStatus(formData.get("status")),
      weekNumber: requiredInteger(formData.get("weekNumber"), "El numero de semana"),
    },
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/weeks/${id}`);
  redirect(`/projects/${projectId}/weeks/${id}`);
}

export async function deleteWeeklyPeriod(formData: FormData) {
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const id = requiredString(formData.get("id"), "La semana");

  await prisma.weeklyPeriod.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function toggleWeeklyPeriodStatus(formData: FormData) {
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const id = requiredString(formData.get("id"), "La semana");
  const status = periodStatus(formData.get("status"));

  await prisma.weeklyPeriod.update({
    data: {
      status: status === PeriodStatus.OPEN ? PeriodStatus.CLOSED : PeriodStatus.OPEN,
    },
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/weeks/${id}`);
  redirect(`/projects/${projectId}/weeks/${id}`);
}
