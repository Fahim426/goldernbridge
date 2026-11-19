'use client'

import { ArrowUpRight, Check } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { enquirySchema, fieldErrors, unitOptions } from '@/lib/enquiry-schema'
import './enquiry.css'

type Errors = Record<string, string>
const requiredText = [
  { key: 'fullName', label: 'Full name', type: 'text', autoComplete: 'name', placeholder: 'Your full name', maxLength: 120 },
  { key: 'email', label: 'Email address', type: 'email', autoComplete: 'email', placeholder: 'you@example.com', maxLength: 254 },
  { key: 'phone', label: 'Phone with country code', type: 'tel', autoComplete: 'tel', placeholder: '+971 50 123 4567', maxLength: 32 },
] as const

export default function EnquiryForm() {
  const form = useRef<HTMLFormElement>(null)
  const successTitle = useRef<HTMLHeadingElement>(null)
  const retry = useRef<{ fields: string, key: string } | null>(null)
  const sending = useRef(false)
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const selectResidence = (event: Event) => {
      const value: unknown = (event as CustomEvent).detail
      if (typeof value !== 'string' || !unitOptions.some(option => option.value === value)) return
      if (done) { setDone(false) }
      requestAnimationFrame(() => {
        const field = form.current?.elements.namedItem('interestedUnitType')
        if (field instanceof HTMLSelectElement) field.value = value
      })
    }
    const requestResource = (event: Event) => {
      const resource: unknown = (event as CustomEvent).detail
      if (resource !== 'brochure' && resource !== 'floor plan') return
      if (done) setDone(false)
      requestAnimationFrame(() => {
        const field = form.current?.elements.namedItem('message')
        const request = 'Please send me the Liora ' + resource + '.'
        if (field instanceof HTMLTextAreaElement && !field.value.includes(request)) {
          const combined = [field.value.trim(), request].filter(Boolean).join('\n')
          if (combined.length <= field.maxLength) field.value = combined
        }
      })
    }
    window.addEventListener('liora:unit', selectResidence)
    window.addEventListener('liora:resource', requestResource)
    return () => {
      window.removeEventListener('liora:unit', selectResidence)
      window.removeEventListener('liora:resource', requestResource)
    }
  }, [done])

  useEffect(() => { if (done) successTitle.current?.focus({ preventScroll: true }) }, [done])

  function showErrors(fields: Errors) {
    setErrors(fields)
    const first = form.current?.elements.namedItem(Object.keys(fields)[0])
    if (first instanceof HTMLElement) first.focus()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending.current) return
    setNotice('')
    const values = new FormData(event.currentTarget)
    const params = new URLSearchParams(window.location.search)
    const fields = {
      fullName: values.get('fullName'), email: values.get('email'), phone: values.get('phone'),
      interestedUnitType: values.get('interestedUnitType'), message: values.get('message'),
      contactConsent: values.has('contactConsent'), website: values.get('website') || '',
      utmSource: params.get('utm_source')?.trim().slice(0, 128) || undefined,
      utmMedium: params.get('utm_medium')?.trim().slice(0, 128) || undefined,
      utmCampaign: params.get('utm_campaign')?.trim().slice(0, 128) || undefined,
    }
    const snapshot = JSON.stringify(fields)
    if (retry.current?.fields !== snapshot) retry.current = { fields: snapshot, key: crypto.randomUUID() }
    const result = enquirySchema.safeParse({ ...fields, idempotencyKey: retry.current.key })
    if (!result.success) {
      showErrors(fieldErrors(result.error))
      setNotice('Please review the highlighted fields.')
      return
    }
    setErrors({})
    sending.current = true
    setPending(true)
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result.data),
      })
      const reply = await response.json()
      if (response.ok && reply.ok === true) {
        retry.current = null
        setDone(true)
      } else {
        if (reply.errors) showErrors(reply.errors)
        setNotice(reply.message || 'Your enquiry could not be saved. Please try again.')
      }
    } catch {
      setNotice('We could not confirm receipt. Please try again with the same details.')
    } finally {
      setPending(false)
      sending.current = false
    }
  }

  function fieldProps(name: string) {
    return { id: 'enquiry-' + name, name, 'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? 'error-' + name : undefined }
  }
  function errorText(name: string) {
    return errors[name] && <span className="lc-form-error" id={'error-' + name}>{errors[name]}</span>
  }

  if (done) return <div className="lc-form-success" role="status">
    <span className="lc-success-mark"><Check aria-hidden="true" size={22} /></span>
    <h3 ref={successTitle} tabIndex={-1}>Enquiry received</h3>
    <p>Thank you for your interest in Liora. Your details and residence preference have been saved for the project team.</p>
    <button type="button" onClick={() => { setDone(false); requestAnimationFrame(() => form.current?.querySelector('input')?.focus()) }}>Make another enquiry <ArrowUpRight size={16} aria-hidden="true" /></button>
  </div>

  return <form noValidate ref={form} className="lc-form" onSubmit={submit} aria-label="Liora property enquiry" aria-busy={pending}>
    <div className="lc-form-grid">
      {requiredText.map(({ key, label, ...input }) => <div className="lc-field" key={key}>
        <label htmlFor={'enquiry-' + key}>{label}</label>
        <input required {...fieldProps(key)} {...input} />
        {errorText(key)}
      </div>)}
      <div className="lc-field">
        <label htmlFor="enquiry-interestedUnitType">Residence preference</label>
        <select {...fieldProps('interestedUnitType')} required defaultValue="">
          <option value="" disabled>Select a preference</option>
          {unitOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        {errorText('interestedUnitType')}
      </div>
      <div className="lc-field lc-wide">
        <label htmlFor="enquiry-message">Message <span>(optional)</span></label>
        <textarea {...fieldProps('message')} rows={3} maxLength={2000} placeholder="What would you like to know about Liora?" />
        {errorText('message')}
      </div>
    </div>
    <div className="lc-web" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="lc-consent"><input {...fieldProps('contactConsent')} type="checkbox" required />
      <div><label htmlFor="enquiry-contactConsent">I agree to be contacted about my Liora enquiry.</label>{' '}
      <Link href="/privacy" target="_blank" rel="noopener">Privacy information<span className="sr-only"> (opens in a new tab)</span></Link></div>
    </div>
    {errorText('contactConsent')}
    {notice && <p className="lc-form-notice" role="alert">{notice}</p>}
    <button className="lc-send" type="submit" disabled={pending}>{pending ? 'Sending enquiry…' : 'Send enquiry'} <ArrowUpRight size={18} aria-hidden="true" /></button>
    <p className="lc-demo-note">Assessment demo · Please use fictional contact details.</p>
  </form>
}
