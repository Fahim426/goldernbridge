import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import type { LeadStatus } from "@/generated/prisma/enums";
import { formatDate, unitLabel } from "./presentation";
import LeadStatusBadge from "./LeadStatusBadge";

export const tableFields = {
  id: true, fullName: true, email: true, interestedUnitType: true, status: true, createdAt: true,
} as const;
type Row = {
  id: string; fullName: string; email: string; interestedUnitType: string; status: LeadStatus; createdAt: Date;
};

export default function LeadTable({ rows, filtered = false }: { rows: Row[]; filtered?: boolean }) {
  if (rows.length === 0) return (
    <div className="staff-empty">
      <Inbox size={29} strokeWidth={1.4} aria-hidden="true" />
      <h3>{filtered ? "No matching leads" : "No enquiries yet"}</h3>
      <p>{filtered ? "Try a different search or clear the filters." : "Enquiries submitted through the Liora project page will appear here."}</p>
      {filtered && <Link className="staff-link" href="/admin/leads">Clear filters <ChevronRight size={15} aria-hidden="true" /></Link>}
    </div>
  );
  return (
    <table className="staff-table" role="table">
      <caption className="staff-sr-only">Property enquiries. Select a contact to view their lead details.</caption>
      <thead><tr>
        <th scope="col">Contact</th><th scope="col">Unit interest</th>
        <th scope="col">Status</th><th scope="col">Received · GST</th>
      </tr></thead>
      <tbody>{rows.map((lead) => (
        <tr key={lead.id}>
          <td className="staff-table-person">
            <Link href={`/admin/leads/${lead.id}`} prefetch={false}>{lead.fullName}<ChevronRight size={14} aria-hidden="true" /></Link>
            <span>{lead.email}</span>
          </td>
          <td className="staff-table-unit">{unitLabel(lead.interestedUnitType)}</td>
          <td className="staff-table-status"><LeadStatusBadge status={lead.status} /></td>
          <td className="staff-table-date"><time dateTime={lead.createdAt.toISOString()}>{formatDate(lead.createdAt)}</time></td>
        </tr>
      ))}</tbody>
    </table>
  );
}
