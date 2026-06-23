import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

const writeRoles = new Set(["ADMIN", "ARCHITECT", "CAPTURE"]);

export async function requireWriteAccess() {
  const user = await requireUser();

  if (!writeRoles.has(user.role)) {
    redirect("/");
  }

  return user;
}

export async function requireManagerAccess() {
  const user = await requireUser();

  if (user.role !== "ADMIN" && user.role !== "ARCHITECT") {
    redirect("/");
  }

  return user;
}
