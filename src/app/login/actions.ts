"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { setSession, clearSession } from "@/lib/session";

function requiredString(value: FormDataEntryValue | null, fieldName: string) {
  const text = String(value ?? "").trim();

  if (!text) {
    throw new Error(`${fieldName} es obligatorio.`);
  }

  return text;
}

export async function login(formData: FormData) {
  const email = requiredString(formData.get("email"), "El correo").toLowerCase();
  const password = requiredString(formData.get("password"), "La contrasena");
  const next = String(formData.get("next") ?? "/");
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user?.active || !verifyPassword(password, user.passwordHash)) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  await setSession(user);
  redirect(next.startsWith("/") ? next : "/");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
