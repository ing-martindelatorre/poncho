"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireManagerAccess } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { booleanFrom, optionalString, requiredString } from "@/lib/form-helpers";

export async function createSupplier(formData: FormData) {
  await requireManagerAccess();
  await prisma.supplier.create({
    data: {
      email: optionalString(formData.get("email")),
      name: requiredString(formData.get("name"), "El proveedor"),
      notes: optionalString(formData.get("notes")),
      phone: optionalString(formData.get("phone")),
      taxId: optionalString(formData.get("taxId")),
    },
  });

  revalidatePath("/catalogs");
  redirect("/catalogs");
}

export async function updateSupplier(formData: FormData) {
  await requireManagerAccess();
  const id = requiredString(formData.get("id"), "El proveedor");

  await prisma.supplier.update({
    data: {
      active: booleanFrom(formData.get("active")),
      email: optionalString(formData.get("email")),
      name: requiredString(formData.get("name"), "El proveedor"),
      notes: optionalString(formData.get("notes")),
      phone: optionalString(formData.get("phone")),
      taxId: optionalString(formData.get("taxId")),
    },
    where: { id },
  });

  revalidatePath("/catalogs");
  redirect("/catalogs");
}

export async function deleteSupplier(formData: FormData) {
  await requireManagerAccess();
  const id = requiredString(formData.get("id"), "El proveedor");

  await prisma.supplier.delete({
    where: { id },
  });

  revalidatePath("/catalogs");
  redirect("/catalogs");
}

export async function createContractor(formData: FormData) {
  await requireManagerAccess();
  await prisma.contractor.create({
    data: {
      email: optionalString(formData.get("email")),
      name: requiredString(formData.get("name"), "El contratista"),
      notes: optionalString(formData.get("notes")),
      phone: optionalString(formData.get("phone")),
      trade: optionalString(formData.get("trade")),
    },
  });

  revalidatePath("/catalogs");
  redirect("/catalogs");
}

export async function updateContractor(formData: FormData) {
  await requireManagerAccess();
  const id = requiredString(formData.get("id"), "El contratista");

  await prisma.contractor.update({
    data: {
      active: booleanFrom(formData.get("active")),
      email: optionalString(formData.get("email")),
      name: requiredString(formData.get("name"), "El contratista"),
      notes: optionalString(formData.get("notes")),
      phone: optionalString(formData.get("phone")),
      trade: optionalString(formData.get("trade")),
    },
    where: { id },
  });

  revalidatePath("/catalogs");
  redirect("/catalogs");
}

export async function deleteContractor(formData: FormData) {
  await requireManagerAccess();
  const id = requiredString(formData.get("id"), "El contratista");

  await prisma.contractor.delete({
    where: { id },
  });

  revalidatePath("/catalogs");
  redirect("/catalogs");
}
