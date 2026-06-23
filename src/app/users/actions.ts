"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword } from "@/lib/password";
import { requireAdmin } from "@/lib/session";
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

function userRole(value: FormDataEntryValue | null) {
  const text = String(value ?? UserRole.CAPTURE);

  if (!Object.values(UserRole).includes(text as UserRole)) {
    return UserRole.CAPTURE;
  }

  return text as UserRole;
}

function booleanFrom(value: FormDataEntryValue | null) {
  return String(value ?? "true") === "true";
}

export async function createUser(formData: FormData) {
  await requireAdmin();
  const password = requiredString(formData.get("password"), "La contrasena");

  if (password.length < 10) {
    redirect("/users?error=short-password");
  }

  await prisma.user.create({
    data: {
      email: requiredString(formData.get("email"), "El correo").toLowerCase(),
      name: requiredString(formData.get("name"), "El nombre"),
      passwordHash: hashPassword(password),
      role: userRole(formData.get("role")),
    },
  });

  revalidatePath("/users");
  redirect("/users");
}

export async function updateUser(formData: FormData) {
  await requireAdmin();
  const id = requiredString(formData.get("id"), "El usuario");
  const password = optionalString(formData.get("password"));

  if (password && password.length < 10) {
    redirect("/users?error=short-password");
  }

  await prisma.user.update({
    data: {
      active: booleanFrom(formData.get("active")),
      email: requiredString(formData.get("email"), "El correo").toLowerCase(),
      name: requiredString(formData.get("name"), "El nombre"),
      passwordHash: password ? hashPassword(password) : undefined,
      role: userRole(formData.get("role")),
    },
    where: { id },
  });

  revalidatePath("/users");
  redirect("/users");
}

export async function deleteUser(formData: FormData) {
  const current = await requireAdmin();
  const id = requiredString(formData.get("id"), "El usuario");

  if (id === current.id) {
    redirect("/users?error=self-delete");
  }

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/users");
  redirect("/users");
}
