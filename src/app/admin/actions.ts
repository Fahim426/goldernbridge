"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, signInAdmin, signOutAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isLeadStatus, statusLabels } from "@/components/admin/presentation";

export type ActionFeedback = { error?: string; message?: string };

export async function loginAction(_: ActionFeedback, formData: FormData): Promise<ActionFeedback> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string" || !email || !password
      || email.length > 254 || password.length > 256) {
    return { error: "Enter your staff email and password." };
  }
  try {
    const result = await signInAdmin(email.trim().toLowerCase(), password);
    if (result === "limited") return { error: "Too many sign-in attempts. Please try again later." };
    if (result !== "ok") return { error: "The email or password is incorrect." };
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again." };
  }
  redirect("/admin");
}

export async function logoutAction() {
  await signOutAdmin();
  redirect("/admin/login");
}

export async function updateStatusAction(
  id: string, expectedVersion: number, _: ActionFeedback, formData: FormData,
): Promise<ActionFeedback> {
  const admin = await requireAdmin();
  const status = formData.get("status");
  if (!isLeadStatus(status)) return { error: "Choose a valid lead status." };
  if (typeof id !== "string" || !id || id.length > 191
      || !Number.isSafeInteger(expectedVersion) || expectedVersion < 1) {
    return { error: "Reload the enquiry before updating its status." };
  }

  let result: "updated" | "unchanged" | "conflict";
  try {
    result = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id }, select: { status: true, version: true } });
      if (!lead || lead.version !== expectedVersion) return "conflict";
      if (lead.status === status) return "unchanged";
      const write = await tx.lead.updateMany({
        where: { id, version: expectedVersion },
        data: { status, version: { increment: 1 } },
      });
      if (!write.count) return "conflict";
      await tx.leadActivity.create({ data: { leadId: id, actorId: admin.id, previousStatus: lead.status, newStatus: status } });
      return "updated";
    });
  } catch {
    return { error: "The status could not be saved. Please try again." };
  }
  revalidatePath(`/admin/leads/${id}`);
  if (result === "conflict") return { error: "This enquiry changed while you were viewing it. Review the current status before saving again." };
  if (result === "unchanged") return { message: "This lead already has that status." };
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { message: `Status updated to ${statusLabels[status]}.` };
}
