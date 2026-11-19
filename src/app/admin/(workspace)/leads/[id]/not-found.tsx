import Link from "next/link";

export default function LeadNotFound() {
  return <section className="staff-box staff-empty">
    <h1>Lead not found</h1>
    <p>This enquiry could not be found in the workspace.</p>
    <Link className="staff-link" href="/admin/leads">Return to lead inbox</Link>
  </section>;
}
