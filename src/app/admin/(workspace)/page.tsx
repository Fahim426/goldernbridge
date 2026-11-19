import Link from 'next/link'
import {requireAdmin} from '@/lib/auth'
import {salesOverview} from '@/lib/sales-overview'
import LeadTable from '@/components/admin/LeadTable'
import {formatDate,statusLabels,unitLabel} from '@/components/admin/presentation'
import type {LeadStatus} from '@/generated/prisma/enums'

export const metadata={title:'Sales overview'}
function Distribution({title,rows}:{title:string,rows:[string,number][]}) {
  const max=Math.max(1,...rows.map(([,count])=>count))
  return <section className="staff-box sales-chart"><h2>{title}</h2>{rows.length ? rows.map(([label,count])=><div className="chart-row" key={label}><span>{label}</span><b>{count}</b><div aria-hidden="true"><i style={{width:count/max*100+'%'}}/></div></div>) : <p>No enquiries in this period.</p>}</section>
}
export default async function OverviewPage({searchParams}:{searchParams:Promise<{range?:string}>}) {
  await requireAdmin()
  const input=(await searchParams).range
  const range=input==='7'||input==='30'?input:'all'
  const data=await salesOverview(range)
  const pipeline=Object.entries(statusLabels).map(([key,label]):[string,number]=>[label,data.counts.get(key as LeadStatus)??0])
  const channels=[...data.channels].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))
  const units=data.units.map((r):[string,number]=>[unitLabel(r.interestedUnitType),r._count._all]).sort((a,b)=>b[1]-a[1])
  return <>
    {process.env.DATABASE_URL && new URL(process.env.DATABASE_URL).pathname.endsWith('_test') && <p className="staff-eyebrow">Demonstration environment · Fictional enquiry data</p>}
    <header className="staff-page-head"><div><p className="staff-eyebrow">Liora · Sales operations</p><h1>Overview</h1></div><span>{formatDate(new Date())} · Dubai</span></header>
    <div className="sales-toolbar"><span>Enquiries received</span><nav aria-label="Enquiry period">{[['7','Last 7 days'],['30','Last 30 days'],['all','All time']].map(([value,label])=><Link key={value} href={'/admin?range='+value} aria-current={range===value?'page':undefined}>{label}</Link>)}</nav></div>
    <section aria-label="Lead statistics" className="staff-metrics sales-metrics">{[['Total leads',data.total,'/admin/leads?range='+range],...pipeline.slice(0,3).map(([label,n])=>[label+' leads',n,'/admin/leads?range='+range+'&status='+label.toUpperCase()]),['Due today',data.due,'#attention'],['Overdue',data.overdue,'#attention']].map(([label,value,href])=><Link href={String(href)} className="staff-metric" key={label}><span>{label}</span><strong>{value}</strong></Link>)}</section>
    <div className="chart-grid"><Distribution title="Lead pipeline" rows={pipeline}/><Distribution title="Marketing sources" rows={channels}/><Distribution title="Residence interest" rows={units}/></div>
    <section id="attention" className="staff-box attention"><div className="staff-box-head"><h2>Needs Attention</h2><span>{data.queue.length} shown</span></div>
    {data.queue.map(row=><Link href={'/admin/leads/'+row.id} key={row.id}><strong>{row.fullName}</strong><span data-reason={row.reason}>{row.reason} ↗</span></Link>)}{!data.queue.length&&<p>No leads require attention in this period.</p>}</section>
    <section className="staff-box"><div className="staff-box-head"><h2>Recent enquiries</h2><Link href="/admin/leads" className="staff-link">View all leads →</Link></div><LeadTable rows={data.recent}/></section>
  </>
}
