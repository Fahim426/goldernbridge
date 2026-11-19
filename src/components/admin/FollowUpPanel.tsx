'use client'
import {useActionState,useState} from 'react'
import {saveFollowUp} from '@/app/admin/follow-up-actions'

export function FollowUpForm({id,version,open}:{id:string,version:number,open:boolean}) {
  const [action,setAction] = useState(open?'RESCHEDULE':'SCHEDULE')
  const [state,submit,pending] = useActionState(saveFollowUp.bind(null,id,version),{})
  const schedule = ['SCHEDULE','RESCHEDULE'].includes(action)
  return <form className="staff-form follow-form" action={submit}>
    <label htmlFor="activity-action">Staff action</label>
    <select name="action" id="activity-action" value={action} onChange={e=>setAction(e.target.value)}>
      {open ? <><option value="RESCHEDULE">Reschedule follow-up</option><option value="COMPLETE">Complete follow-up</option></> : <option value="SCHEDULE">Schedule follow-up</option>}
      <option value="CONTACT">Log contact attempt</option><option value="NOTE">Add note</option>
    </select>
    {schedule && <div className="follow-dates"><label>Follow-up date<input type="date" name="date" required/></label><label>Time in Dubai (optional)<input type="time" name="time"/></label></div>}
    <label htmlFor="activity-details">{schedule?'Follow-up notes (optional)':action==='NOTE'?'Note':'Contact outcome'}</label>
    <textarea id="activity-details" name="details" rows={3} maxLength={1600} required={!schedule}/>
    <button className="staff-primary" disabled={pending}>{pending?'Saving…':'Save activity'}</button>
    {state.error && <p role="alert">{state.error}</p>}{state.message && <p role="status">{state.message}</p>}
  </form>
}

export function CopyPhone({phone}:{phone:string}) {
  const [message,setMessage]=useState('')
  return <><button className="staff-link" type="button" onClick={async()=>{try{await navigator.clipboard.writeText(phone);setMessage('Number copied.')}catch{setMessage('Select and copy the phone number above.')}}}>Copy number</button><span role="status">{message}</span></>
}
