import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FollowUpForm, CopyPhone } from "@/components/admin/FollowUpPanel";
import { activityLabels, dueLabel, whatsappUrl } from "@/lib/follow-up";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LeadStatusBadge from "@/components/admin/LeadStatusBadge";
import { StatusForm } from "@/components/admin/StaffForms";
import { formatDate, formatTime, statusLabels, unitLabel } from "@/components/admin/presentation";

export const metadata: Metadata = { title: "Lead details" };

function timestamp(value: Date) {
  return <time dateTime={value.toISOString()}>{formatDate(value)} · {formatTime(value)} GST</time>;
}

export default async function LeadDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams:Promise<{history?:string}> }) {
  await requireAdmin();
  const { id } = await params;
  const historyInput = (await searchParams).history ?? '';
  const historyPage = /^[1-9]\d{0,5}$/.test(historyInput) ? Number(historyInput) : 1;
  if (id.length > 191) notFound();
  const lead = await prisma.lead.findUnique({
    where: { id },
    select: {
      id: true, version: true, fullName: true, email: true, phone: true, message: true,
      status: true, interestedUnitType: true, leadSource: true,
      contactConsentAt: true, marketingConsentAt: true, createdAt: true,
      followUp: true,
      utmSource: true, utmMedium: true, utmCampaign: true, project: { select: { name: true } },
      activities: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (historyPage-1)*20, take: 21,
        select: { id: true, action: true, details: true, previousStatus: true, newStatus: true, createdAt: true, actor: { select: { name: true } } },
      },
    },
  });
  if (!lead) notFound();
  const follow = lead.followUp;
  const whatsapp = whatsappUrl(lead.phone, lead.project.name, Boolean(lead.contactConsentAt));
  return (
    <>
      <Link className="staff-breadcrumb" href="/admin/leads"><ArrowLeft size={15} aria-hidden="true" /> Lead inbox</Link>
      <header className="staff-page-head staff-detail-head">
        <div><p className="staff-eyebrow">Lead details</p><h1>{lead.fullName}</h1>
          <p className="staff-subtitle">Received {timestamp(lead.createdAt)}</p></div>
        <LeadStatusBadge status={lead.status} />
      </header>
      <div className="staff-detail-grid">
        <div className="staff-detail-col">
          <section className="staff-box staff-detail-box"><h2>Enquiry</h2>
            <dl className="staff-fields">
              <div><dt>Email address</dt><dd><a href={`mailto:${lead.email}`}>{lead.email}</a></dd></div>
              <div><dt>Phone number</dt><dd><a href={`tel:${lead.phone}`}>{lead.phone}</a></dd></div>
              <div><dt>Project</dt><dd>{lead.project.name}</dd></div>
              <div><dt>Unit interest</dt><dd>{unitLabel(lead.interestedUnitType)}</dd></div>
            </dl>
            <div className="staff-message"><h3>Message</h3><p>{lead.message || "No message provided."}</p></div>
            <div className="contact-tools">{whatsapp && <a className="staff-primary" href={whatsapp} target="_blank" rel="noopener noreferrer">Contact on WhatsApp ↗</a>}<CopyPhone phone={lead.phone}/></div>
            <small>Contact consent recorded {formatDate(lead.contactConsentAt)}. Review the draft in WhatsApp, then log the outcome here.</small>
          </section>
          <section className="staff-box staff-detail-box"><h2>Source and consent</h2>
            <dl className="staff-fields">
              <div><dt>Lead source</dt><dd>{lead.leadSource}</dd></div>
              <div><dt>UTM source</dt><dd>{lead.utmSource ?? "Unspecified"}</dd></div>
              <div><dt>UTM medium</dt><dd>{lead.utmMedium ?? "Unspecified"}</dd></div>
              <div><dt>UTM campaign</dt><dd>{lead.utmCampaign ?? "Unspecified"}</dd></div>
              <div><dt>Contact consent</dt><dd>{timestamp(lead.contactConsentAt)}</dd></div>
              <div><dt>Marketing consent</dt><dd>{lead.marketingConsentAt ? timestamp(lead.marketingConsentAt) : "No opt-in"}</dd></div>
            </dl>
          </section>
        </div>
        <div className="staff-detail-col">
          <section className="staff-box staff-detail-box"><h2>Follow-up desk</h2>
            <p className="schedule-summary">{follow ? <><strong>{dueLabel(follow.scheduledAt,follow.completedAt)}</strong> · {formatDate(follow.scheduledAt)} {follow.hasTime && formatTime(follow.scheduledAt) + ' GST'}<br/>{follow.notes}</> : 'No follow-up scheduled.'}</p>
            <FollowUpForm key={follow?.version ?? 0} id={id} version={follow?.version ?? 0} open={Boolean(follow && !follow.completedAt)}/>
          </section>
          <section className="staff-box staff-detail-box"><h2>Manage status</h2>
            <StatusForm id={lead.id} status={lead.status} version={lead.version} />
          </section>
          <section className="staff-box staff-detail-box"><h2>Recent contact history</h2>
            {lead.activities.length > 0 ? <ol className="staff-history">
              {lead.activities.slice(0,20).map((activity) => <li key={activity.id}>
                <p><strong>{activityLabels[activity.action]}</strong></p>
                <p>{activity.previousStatus && activity.newStatus ? statusLabels[activity.previousStatus] + ' → ' + statusLabels[activity.newStatus] : activity.details}</p>
                <span>{activity.actor?.name ?? "Staff"} · {timestamp(activity.createdAt)}</span>
              </li>)}
            </ol> : <p className="staff-history-empty">No staff activity recorded yet.</p>}
            <nav className="contact-tools" aria-label="Activity history pages">
              {historyPage>1 && <Link href={'?history='+(historyPage-1)}>Newer entries</Link>}
              {lead.activities.length>20 && <Link href={'?history='+(historyPage+1)}>Older entries</Link>}
            </nav>
          </section>
        </div>
      </div>
    </>
  );
}
