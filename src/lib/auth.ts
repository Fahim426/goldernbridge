import { randomBytes } from "node:crypto";
import { cache } from "react";
import { compare, hash } from "bcryptjs";
import { getIronSession } from "iron-session";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "./db";
import { networkKey, sessionSecret, takeAttempt } from "./rate-limit";

const cookieName = "liora_staff";
const ttl = 8 * 60 * 60;
let dummyHash: Promise<string> | undefined;

async function readSession() {
  return getIronSession<{ sessionId?: string }>(await cookies(), {
    password: sessionSecret(), cookieName, ttl,
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
  });
}

export const getAdmin = cache(async () => {
  if (!(await cookies()).has(cookieName)) return null;
  const session = await readSession();
  if (!session.sessionId) return null;
  const record = await prisma.adminSession.findFirst({
    where: { id: session.sessionId, expiresAt: { gt: new Date() }, admin: { role: "ADMIN" } },
    select: { admin: { select: { id: true, name: true, email: true } } },
  });
  return record?.admin ?? null;
});

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function signInAdmin(rawEmail: string, password: string): Promise<"ok" | "invalid" | "limited"> {
  const email = rawEmail.trim().toLowerCase();
  if (email.length > 254 || !z.email().safeParse(email).success || !password || Buffer.byteLength(password) > 72) return "invalid";
  const networkAllowed = await takeAttempt("staff-network", networkKey(await headers()), 30, 900);
  if (!networkAllowed || !await takeAttempt("staff-email", email, 10, 900)) return "limited";

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  // Run the same password comparison for unknown accounts.
  dummyHash ??= hash(randomBytes(32).toString("hex"), 12);
  const valid = await compare(password, admin?.passwordHash ?? await dummyHash);
  if (!valid || !admin || admin.role !== "ADMIN") return "invalid";

  const session = await readSession();
  const [ , created ] = await prisma.$transaction([
    prisma.adminSession.deleteMany({
      where: { OR: [{ expiresAt: { lte: new Date() } }, ...(session.sessionId ? [{ id: session.sessionId }] : [])] },
    }),
    prisma.adminSession.create({ data: { adminId: admin.id, expiresAt: new Date(Date.now() + ttl * 1000) } }),
  ]);
  session.sessionId = created.id;
  await session.save();
  return "ok";
}

export async function signOutAdmin() {
  const session = await readSession();
  if (session.sessionId) await prisma.adminSession.deleteMany({ where: { id: session.sessionId } });
  session.destroy();
}
