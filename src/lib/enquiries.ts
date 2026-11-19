import { createHash } from "node:crypto";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "./db";
import type { Enquiry } from "./enquiry-schema";
import { takeAttempt } from "./rate-limit";

export async function recordEnquiry(input: Enquiry, network: string) {
  const { idempotencyKey, fullName, email, phone, interestedUnitType } = input;
  const fields = {
    fullName, email, phone, interestedUnitType,
    message: input.message || null,
    utmSource: input.utmSource || null,
    utmMedium: input.utmMedium || null,
    utmCampaign: input.utmCampaign || null,
  };
  const digest = createHash("sha256").update(JSON.stringify([fields, input.marketingConsent])).digest("hex");
  const existing = () => prisma.lead.findUnique({ where: { idempotencyKey }, select: { requestDigest: true } });
  const prior = await existing();
  if (prior) return prior.requestDigest === digest ? "retry" : "conflict";
  if (!await takeAttempt("enquiries", network, 10, 600)) return "limited";
  const project = await prisma.project.findFirst({ where: { slug: "liora", status: "ACTIVE" }, select: { id: true } });
  if (!project) return "unavailable";
  const now = new Date();
  try {
    await prisma.lead.create({
      data: {
        ...fields, projectId: project.id, leadSource: "Liora landing page",
        idempotencyKey, requestDigest: digest,
        contactConsentAt: now, marketingConsentAt: input.marketingConsent ? now : null,
      },
    });
  } catch (error) {
    // A concurrent request may have committed between the initial read and
    // this insert. The database enforces uniqueness even across app instances.
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const winner = await existing();
    if (!winner) throw error;
    return winner.requestDigest === digest ? "retry" : "conflict";
  }
  return "created";
}
