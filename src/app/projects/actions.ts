"use server";

import { ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireManagerAccess } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { optionalDate, optionalDecimal, optionalString, requiredString } from "@/lib/form-helpers";

function projectStatus(value: FormDataEntryValue | null) {
  const text = String(value ?? ProjectStatus.ACTIVE);

  if (!Object.values(ProjectStatus).includes(text as ProjectStatus)) {
    return ProjectStatus.ACTIVE;
  }

  return text as ProjectStatus;
}

export async function createProject(formData: FormData) {
  await requireManagerAccess();
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
  await requireManagerAccess();
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
  await requireManagerAccess();
  const id = requiredString(formData.get("id"), "La obra");

  await prisma.project.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  redirect("/projects");
}
