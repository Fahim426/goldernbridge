import type { Metadata } from 'next'
import Link from 'next/link'
import './privacy.css'

export const metadata: Metadata = { title: 'Enquiry privacy', ...(process.env.SITE_URL ? {alternates: { canonical: '/privacy' }} : {}) }

export default function Privacy() {
  return <main className="privacy-page">
    <Link className="privacy-back" href="/">← Back to Liora</Link>
    <p className="privacy-project">Golden Bridge / Liora Connect</p>
    <h1>Your enquiry data</h1>
    <p>Liora Connect is an independent internship assessment. Please use fictional contact details when trying the demonstration.</p>
    <h2>What the form records</h2>
    <p>Submitting the form saves your name, email address, international phone number, unit interest, optional message and the time you consented to contact. When the page is opened from a campaign link, its source, medium and campaign name may accompany the enquiry.</p>
    <h2>Who can see it</h2>
    <p>Authorized staff accounts in this demonstration can review enquiries and record follow-up status. Records stay in the application’s configured MySQL database. The form sends no marketing email or CRM notification.</p>
    <h2>Removing a demonstration entry</h2>
    <p>Contact the person who shared this demonstration with you. Give them the email address and approximate time of your submission so the operator can locate and remove the entry.</p>
    <Link className="privacy-back" href="/#enquiry">Return to enquiry →</Link>
  </main>
}
