"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriteAccess } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { optionalDecimal, optionalString, requiredDate, requiredString } from "@/lib/form-helpers";
import { assertWeeklyPeriodOpen } from "@/lib/periods";

function materialPath(projectId: string, periodId: string, materialId: string) {
  return `/projects/${projectId}/weeks/${periodId}/materials/${materialId}`;
}

export async function createMaterialDelivery(formData: FormData) {
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const materialPurchaseId = requiredString(formData.get("materialPurchaseId"), "El material");
  await assertWeeklyPeriodOpen(weeklyPeriodId);

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
  await requireWriteAccess();
  const projectId = requiredString(formData.get("projectId"), "La obra");
  const weeklyPeriodId = requiredString(formData.get("weeklyPeriodId"), "La semana");
  const materialPurchaseId = requiredString(formData.get("materialPurchaseId"), "El material");
  const id = requiredString(formData.get("id"), "La entrega");
  await assertWeeklyPeriodOpen(weeklyPeriodId);

  await prisma.materialDelivery.delete({
    where: { id },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/weeks/${weeklyPeriodId}`);
  revalidatePath(materialPath(projectId, weeklyPeriodId, materialPurchaseId));
  redirect(materialPath(projectId, weeklyPeriodId, materialPurchaseId));
}
