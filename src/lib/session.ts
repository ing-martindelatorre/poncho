import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";

export const sessionCookieName = "poncho_session";
const maxAgeSeconds = 60 * 60 * 12;

type SessionPayload = {
  exp: number;
  role: UserRole;
  userId: string;
};

function secret() {
  return process.env.AUTH_SECRET || process.env.BASIC_AUTH_PASSWORD || "dev-secret";
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const body = base64url(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
    }),
  );

  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");

  if (!body || !signature || sign(body) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;

    if (!payload.userId || !payload.role || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function setSession(user: { id: string; role: UserRole }) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, createSessionToken({ role: user.role, userId: user.id }), {
    httpOnly: true,
    maxAge: maxAgeSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function currentUser() {
  const cookieStore = await cookies();
  const payload = verifySessionToken(cookieStore.get(sessionCookieName)?.value);

  if (!payload) {
    return null;
  }

  return prisma.user.findFirst({
    select: {
      active: true,
      email: true,
      id: true,
      name: true,
      role: true,
    },
    where: {
      active: true,
      id: payload.userId,
    },
  });
}

export async function requireUser() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}
