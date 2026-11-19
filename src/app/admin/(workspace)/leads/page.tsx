import type { Metadata } from "next";
import {enquiryPeriod} from "@/lib/follow-up";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import LeadTable, { tableFields } from "@/components/admin/LeadTable";
import { pageSize, pageUrl, parseFilters, statusLabels, type QueryInput } from "@/components/admin/presentation";

export const metadata: Metadata = { title: "Lead inbox" };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<QueryInput> }) {
  await requireAdmin();
  const filters = parseFilters(await searchParams);
  const where: Prisma.LeadWhereInput = { status: filters.status, ...enquiryPeriod(filters.range) };
  if (filters.term) {
    // MySQL LIKE treats these as pattern characters. Search for the literal text the user supplied.
    const contains = filters.term.replace(/[\\%_]/g, "\\$&");
    where.OR = [{ fullName: { contains } }, { email: { contains } }, { phone: { contains } }];
  }
  const direction = filters.sort === "newest" ? "desc" : "asc";
  const { count, pages, page, rows } = await prisma.$transaction(async (tx) => {
    const count = await tx.lead.count({ where });
    const pages = Math.max(1, Math.ceil(count / pageSize));
    const page = Math.min(filters.page, pages);
    const rows = await tx.lead.findMany({
      where, select: tableFields, orderBy: [{ createdAt: direction }, { id: direction }],
      skip: (page - 1) * pageSize, take: pageSize,
    });
    return { count, pages, page, rows };
  });
  return (
    <>
      <header className="staff-page-head"><div><p className="staff-eyebrow">Liora Connect</p><h1>Lead inbox</h1></div></header>
      <section className="staff-box" aria-label="Enquiry records">
        <form className="staff-filters" action="/admin/leads" method="get">
          {filters.range && <input type="hidden" name="range" value={filters.range}/>}
          <div className="staff-search-field">
            <label htmlFor="lead-search">Search leads</label>
            <div className="staff-search-wrap"><Search size={17} aria-hidden="true" /><input id="lead-search" type="search" name="q" maxLength={120} defaultValue={filters.term} placeholder="Name, email or phone" /></div>
          </div>
          <div><label htmlFor="list-status">Lead status</label><select id="list-status" name="status" defaultValue={filters.status ?? ""}>
            <option value="">All statuses</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></div>
          <div><label htmlFor="sort-order">Sort by</label><select id="sort-order" name="sort" defaultValue={filters.sort}>
            <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
          </select></div>
          <button type="submit" className="staff-primary">Apply filters</button>
        </form>
        <div className="staff-results-head"><h2>{count.toLocaleString("en-GB")} {count === 1 ? "lead" : "leads"}</h2>
          {filters.range && <span>Received in the last {filters.range} days</span>}
          {(filters.term || filters.status || filters.range || filters.sort !== "newest") && <Link href="/admin/leads" className="staff-link">Reset filters</Link>}
        </div>
        <LeadTable rows={rows} filtered={Boolean(filters.term || filters.status)} />
        {pages > 1 && <nav className="staff-pagination" aria-label="Lead pages">
          <p>Page {page} of {pages}</p>
          {page > 1 && <Link href={pageUrl(filters, page - 1)}><ArrowLeft size={15} aria-hidden="true" /> Previous</Link>}
          {page < pages && <Link href={pageUrl(filters, page + 1)}>Next <ArrowRight size={15} aria-hidden="true" /></Link>}
        </nav>}
      </section>
    </>
  );
}
