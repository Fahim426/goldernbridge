import { createHmac, randomInt } from "node:crypto";
import { isIP } from "node:net";
import { prisma } from "./db";

export function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32 || secret.startsWith("REPLACE_")) throw new Error("Configure SESSION_SECRET.");
  return secret;
}

export function networkKey(headers: Pick<Headers, "get">) {
  // Vercel supplies this header at its trusted edge. Direct/local servers
  // share a bucket so a client-supplied forwarding header cannot reset it.
  const ip = process.env.VERCEL === "1" ? headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : undefined;
  return ip && isIP(ip) ? ip : "direct";
}

export async function takeAttempt(scope: string, identity: string, limit: number, seconds: number) {
  const key = createHmac("sha256", sessionSecret()).update(scope + "\0" + identity).digest("hex");
  // The unique-key write locks this row until its count is read and committed,
  // including when requests land on different serverless instances.
  const [ , bucket ] = await prisma.$transaction([
    prisma.$executeRaw`INSERT INTO RateBucket (\`key\`, hits, expiresAt)
      VALUES (${key}, 1, TIMESTAMPADD(SECOND, ${seconds}, UTC_TIMESTAMP(3)))
      ON DUPLICATE KEY UPDATE
        hits = IF(expiresAt <= UTC_TIMESTAMP(3), 1, LEAST(hits + 1, ${limit + 1})),
        expiresAt = IF(expiresAt <= UTC_TIMESTAMP(3), TIMESTAMPADD(SECOND, ${seconds}, UTC_TIMESTAMP(3)), expiresAt)`,
    prisma.rateBucket.findUniqueOrThrow({ where: { key }, select: { hits: true } }),
  ]);
  if (randomInt(64) === 0) {
    await prisma.$executeRaw`DELETE FROM RateBucket WHERE expiresAt <= UTC_TIMESTAMP(3) LIMIT 100`;
  }
  return bucket.hits <= limit;
}
