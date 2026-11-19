'use server'
import {revalidatePath} from 'next/cache'
import {requireAdmin} from '@/lib/auth'
import {prisma} from '@/lib/db'
import {scheduleDate} from '@/lib/follow-up'
import {z} from 'zod'
import type {ActionFeedback} from './actions'

const schema = z.object({
  action:z.enum(['SCHEDULE','RESCHEDULE','COMPLETE','CONTACT','NOTE']),
  details:z.string().trim().max(1600), date:z.string(), time:z.string(),
})

export async function saveFollowUp(id:string, version:number, _:ActionFeedback, form:FormData):Promise<ActionFeedback> {
  const actor = await requireAdmin()
  const input = schema.safeParse({action:form.get('action'),details:form.get('details') ?? '',date:form.get('date') ?? '',time:form.get('time') ?? ''})
  if (!z.uuid().safeParse(id).success || !Number.isSafeInteger(version) || version < 0 || !input.success) return {error:'Check the entry and try again.'}
  const {action,details,date,time} = input.data
  const scheduling = action === 'SCHEDULE' || action === 'RESCHEDULE'
  const at = scheduling ? scheduleDate(date,time) : null
  if (scheduling && !at) return {error:'Choose today or a future Dubai date and a valid future time.'}
  if (!scheduling && !details) return {error:'Enter the note or contact outcome.'}
  const conflict = {error:'The follow-up has changed. Refresh this lead and review its schedule.'}
  try {
    const saved = await prisma.$transaction(async tx => {
      if (at) {
        const data = {scheduledAt:at,hasTime:Boolean(time),completedAt:null,notes:details}
        if (version === 0 && action === 'SCHEDULE') {
          await tx.followUp.create({data:{leadId:id,...data}})
        } else {
          const changed = await tx.followUp.updateMany({where:{leadId:id,version,completedAt:action === 'RESCHEDULE' ? null : {not:null}},data:{...data,version:{increment:1}}})
          if (!changed.count) return false
        }
      } else if (action === 'COMPLETE') {
        const changed = await tx.followUp.updateMany({where:{leadId:id,version,completedAt:null},data:{completedAt:new Date(),version:{increment:1}}})
        if (!changed.count) return false
      }
      const summary = at ? [date, time, 'Dubai', details].filter(Boolean).join(' · ') : details
      await tx.leadActivity.create({data:{leadId:id,actorId:actor.id,action,details:summary}})
      return true
    })
    if (!saved) return conflict
  } catch { return {error:'Could not save this entry. Refresh and try again.'} }
  revalidatePath('/admin/leads/' + id)
  revalidatePath('/admin')
  return {message:'Activity recorded.'}
}
