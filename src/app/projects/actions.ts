"use server";

import { ProjectStatus } from "@prisma/client";
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

function optionalDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  return new Date(`${text}T00:00:00.000Z`);
}

function projectStatus(value: FormDataEntryValue | null) {
  const text = String(value ?? ProjectStatus.ACTIVE);

  if (!Object.values(ProjectStatus).includes(text as ProjectStatus)) {
    return ProjectStatus.ACTIVE;
  }

  return text as ProjectStatus;
}

export async function createProject(formData: FormData) {
  const project = await prisma.project.create({
    data: {
      address: optionalString(formData.get("address")),
      builtAreaM2: optionalDecimal(formData.get("builtAreaM2")),
      clientName: optionalString(formData.get("clientName")),
      name: requiredString(formData.get("name"), "El nombre de la obra"),
      notes: optionalString(formData.get("notes")),
      startDate: optionalDate(formData.get("startDate")),
      status: projectStatus(formData.get("status")),
    },
    select: { id: true },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(formData: FormData) {
  const id = requiredString(formData.get("id"), "La obra");

  await prisma.project.update({
    data: {
      address: optionalString(formData.get("address")),
      builtAreaM2: optionalDecimal(formData.get("builtAreaM2")),
      clientName: optionalString(formData.get("clientName")),
      name: requiredString(formData.get("name"), "El nombre de la obra"),
      notes: optionalString(formData.get("notes")),
      startDate: optionalDate(formData.get("startDate")),
      status: projectStatus(formData.get("status")),
    },
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

export async function deleteProject(formData: FormData) {
  const id = requiredString(formData.get("id"), "La obra");

  await prisma.project.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  redirect("/projects");
}
