import {prisma} from './db'
import {dayMs,dubaiDay,enquiryPeriod} from './follow-up'
import {tableFields} from '@/components/admin/LeadTable'

export async function salesOverview(range:string, now=new Date()) {
  const start = new Date(dubaiDay(now)+'T00:00:00+04:00')
  const tomorrow = new Date(start.getTime()+dayMs)
  const cohort = enquiryPeriod(range,now)
  const active = {lead:cohort,completedAt:null}
  const statusGroups = prisma.lead.groupBy({by:['status'],where:cohort,_count:{_all:true}})
  const sourceGroups = prisma.lead.groupBy({by:['utmSource'],where:cohort,_count:{_all:true}})
  const unitGroups = prisma.lead.groupBy({by:['interestedUnitType'],where:cohort,_count:{_all:true}})
  const [pipeline,sources,units,due,overdue,tasks,newLeads,recent] = await prisma.$transaction([
    statusGroups, sourceGroups, unitGroups,
    prisma.followUp.count({where:{...active,scheduledAt:{gte:start,lt:tomorrow}}}),
    prisma.followUp.count({where:{...active,scheduledAt:{lt:start}}}),
    prisma.followUp.findMany({where:{...active,scheduledAt:{lt:tomorrow}},select:{scheduledAt:true,lead:{select:{id:true,fullName:true}}},orderBy:[{scheduledAt:'asc'},{leadId:'asc'}],take:8}),
    prisma.lead.findMany({where:{...cohort,status:'NEW',OR:[{followUp:null},{followUp:{scheduledAt:{gte:tomorrow}}}],activities:{none:{action:{in:['CONTACT','COMPLETE']}}}},select:{id:true,fullName:true},orderBy:[{createdAt:'asc'},{id:'asc'}],take:8}),
    prisma.lead.findMany({where:cohort,select:tableFields,orderBy:[{createdAt:'desc'},{id:'desc'}],take:6}),
  ])
  const queue = [...tasks.map(task=>({...task.lead,reason:task.scheduledAt<start?'Overdue':'Due today'})),...newLeads.map(lead=>({...lead,reason:'Initial contact'}))].slice(0,8)
  const counts = new Map(pipeline.map(row=>[row.status,row._count._all]))
  const channels = new Map<string,number>()
  for(const row of sources) {
    const source = row.utmSource?.trim().toLowerCase() || 'unknown'
    channels.set(source,(channels.get(source)??0)+row._count._all)
  }
  return {counts,total:pipeline.reduce((sum,row)=>sum+row._count._all,0),channels,units,due,overdue,queue,recent}
}
