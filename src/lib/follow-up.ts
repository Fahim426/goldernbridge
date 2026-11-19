export const dayMs = 86400000
const dubaiOffset = 4 * 3600000

export function dubaiDay(now = new Date()) {
  return new Date(now.getTime() + dubaiOffset).toISOString().slice(0, 10)
}

export function scheduleDate(date: string, time: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) return null
  const at = new Date(date + 'T' + (time || '00:00') + ':00+04:00')
  if (!Number.isFinite(at.getTime()) || dubaiDay(at) !== date || date < dubaiDay(now) || (time && at <= now)) return null
  return at
}

export function enquiryPeriod(range: unknown, now = new Date()) {
  if (range !== '7' && range !== '30') return {}
  const start = new Date(dubaiDay(now) + 'T00:00:00+04:00').getTime()
  return {createdAt:{gte:new Date(start - (Number(range)-1)*dayMs),lt:new Date(start+dayMs)}}
}

export function dueLabel(at: Date, completed: Date | null, now = new Date()) {
  if (completed) return 'Completed'
  const day = dubaiDay(at)
  const today = dubaiDay(now)
  return day < today ? 'Overdue' : day === today ? 'Due today' : 'Upcoming'
}

export function whatsappUrl(phone: string, project: string, consent: boolean) {
  if (!consent || !/^\+[1-9]\d{7,14}$/.test(phone)) return null
  return 'https://wa.me/' + phone.slice(1) + '?text=' + encodeURIComponent('Hello, I’m following up on your enquiry about ' + project + ' with Golden Bridge. How can I help?')
}

export const activityLabels = {STATUS:'Status changed', SCHEDULE:'Follow-up scheduled', RESCHEDULE:'Follow-up rescheduled', COMPLETE:'Follow-up completed', CONTACT:'Contact attempt logged', NOTE:'Note added'} as const
