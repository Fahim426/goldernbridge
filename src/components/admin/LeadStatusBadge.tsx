import type { LeadStatus } from "@/generated/prisma/enums";
import { statusLabels } from "./presentation";

export default function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <span className="staff-badge" data-status={status}>{statusLabels[status]}</span>;
}
