"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { setSession } from "@/lib/session";

function requiredString(value: FormDataEntryValue | null, fieldName: string) {
  const text = String(value ?? "").trim();

  if (!text) {
    throw new Error(`${fieldName} es obligatorio.`);
  }

  return text;
}

export async function createFirstAdmin(formData: FormData) {
  const existingUsers = await prisma.user.count();

  if (existingUsers > 0) {
    redirect("/login");
  }

  const name = requiredString(formData.get("name"), "El nombre");
  const email = requiredString(formData.get("email"), "El correo").toLowerCase();
  const password = requiredString(formData.get("password"), "La contrasena");

  if (password.length < 10) {
    redirect("/setup?error=short-password");
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashPassword(password),
      role: "ADMIN",
    },
  });

  await setSession(user);
  redirect("/");
}
