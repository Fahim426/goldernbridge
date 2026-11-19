import "dotenv/config";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "../src/lib/db";

async function seed() {
  const { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } = process.env;
  await prisma.project.upsert({
    where: { slug: "liora" },
    update: {},
    create: { slug: "liora", name: "Liora", status: "ACTIVE" },
  });
  if (!ADMIN_EMAIL && !ADMIN_PASSWORD) {
    console.info("Liora is ready. Set ADMIN_EMAIL and ADMIN_PASSWORD to provision a staff account.");
    return;
  }
  const email = ADMIN_EMAIL?.trim().toLowerCase();
  const name = ADMIN_NAME?.trim() || "Project desk";
  if (!z.email().max(254).safeParse(email).success || !email || name.length > 120 || !ADMIN_PASSWORD ||
      ADMIN_PASSWORD.startsWith("REPLACE_") || ADMIN_PASSWORD.length < 16 || Buffer.byteLength(ADMIN_PASSWORD) > 72) {
    throw new Error("Use a valid admin email, a name under 121 characters and a unique password of 16+ characters (72 bytes maximum).");
  }
  const existing = await prisma.adminUser.findUnique({ where: { email }, select: { id: true } });
  if (!existing) {
    await prisma.adminUser.create({ data: { name, email, passwordHash: await hash(ADMIN_PASSWORD, 12) } });
  }
  console.info("Liora and its staff account are ready.");
}

seed().catch((error: Error) => {
  console.error(error instanceof Error && error.message.startsWith("Use a valid") ? error.message : "Seeding failed. Check the database connection and applied migrations.");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
