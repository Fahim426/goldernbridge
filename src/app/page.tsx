import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import ProjectHeader from "@/components/public/ProjectHeader";
import ProjectHero from "@/components/public/ProjectHero";
import ProjectGallery from "@/components/public/ProjectGallery";
import ResidenceCollection, { ResourceLink } from "@/components/public/ResidenceCollection";
import EnquiryForm from "@/components/public/EnquiryForm";
import "./public.css";

export const metadata: Metadata = process.env.SITE_URL ? {alternates:{canonical:"/"}} : {};

export default function Home() {
  return <div className="lp" id="top">
    <a className="lp-skip" href="#main-content">Skip to content</a><ProjectHeader/>
    <main id="main-content">
      <ProjectHero/>
      <section className="architecture lp-shell" id="overview" aria-labelledby="architecture-title">
        <div className="arch-heading"><div><p className="cine-kicker">The architecture</p><h2 id="architecture-title">Sculpted<br/><em>by light.</em></h2></div>
          <div className="arch-intro"><p>Gold-edged columns meet curved terraces. On Dubai Islands, JaiedCo’s Liora residences bring pale stone, warm timber and tall windows into the same coastal palette.</p><ResourceLink resource="brochure">Request the brochure</ResourceLink></div>
        </div>
        <div className="arch-plates"><figure><Image src="/images/liora-exterior.webp" alt="Sunlight traces the projecting balcony edges and gold-trimmed columns at Liora." fill sizes="(max-width:650px) 95vw, 72vw"/><figcaption>The façade at sunset</figcaption></figure>
          <figure><Image src="/images/liora-details.webp" alt="Close view of sculpted columns beneath a planted balcony." fill sizes="(max-width:650px) 47vw, 26vw"/><figcaption>Column detail</figcaption></figure></div>
      </section>
      <section className="residences" id="residences" aria-labelledby="residences-title"><ResidenceCollection/></section>
      <section className="terraces" aria-labelledby="terrace-title">
        <Image src="/images/liora-terrace.webp" alt="Outdoor dining under an open pergola on Liora’s landscaped terrace." fill sizes="100vw"/>
        <div className="terrace-text"><p className="cine-kicker">Life at Liora</p><h2 id="terrace-title">Under an<br/><em>open sky.</em></h2>
          <p>Gather on the sky terraces for a barbecue. Find a quieter rhythm in the residents’ pools, gym and children’s play area.</p></div>
      </section>
      <ProjectGallery/>
      <section className="islands lp-shell" id="location" aria-labelledby="location-title">
        <div className="island-text"><p className="cine-kicker">The location</p><h2 id="location-title">Dubai<br/><em>Islands.</em></h2>
          <p>Across the water from Deira, Liora sits near Dubai Islands Marina and the Deira Night Souk area.</p>
          <a className="lp-text-link" href="https://www.google.com/maps/search/?api=1&amp;query=78R2%2B9MW%2C%20Dubai%2C%20United%20Arab%20Emirates" target="_blank" rel="noreferrer">Open in Google Maps <ArrowUpRight size={16}/></a></div>
        <figure><Image src="/images/liora-location.webp" alt="JaiedCo’s map marking the Liora plot on Dubai Islands." width={1100} height={742} sizes="(max-width:760px) 94vw, 60vw"/><figcaption>Project location · JaiedCo fact sheet</figcaption></figure>
      </section>
      <section className="private-enquiry" id="enquiry" aria-labelledby="enquiry-title">
        <div className="private-cover"><Image src="/images/liora-portico.webp" alt="Evening light at the entrance to Liora." fill sizes="(max-width:760px) 100vw, 45vw"/>
          <div><p className="cine-kicker">Golden Bridge · Liora</p><h2 id="enquiry-title">Private<br/><em>enquiries.</em></h2></div></div>
        <div className="private-form"><h3>Register your interest</h3><p>Choose a residence or request the brochure. Your enquiry is saved for the project team in this assessment workspace.</p><EnquiryForm/></div>
      </section>
    </main>
    <footer className="lp-footer"><div className="lp-shell">
      <div className="lp-footer-top"><div><Image src="/brand/golden-bridge-white.webp" width={210} height={35} alt="Golden Bridge" unoptimized/><p>Liora Connect · Dubai Islands, UAE</p></div><Image className="lp-footer-liora" src="/brand/liora.webp" width={60} height={75} alt="Liora by JaiedCo Real Estate Development" unoptimized/></div>
      <div className="lp-footer-bottom"><span>Independent internship assessment</span><nav aria-label="Footer navigation"><a href="https://goldenbridgeuae.com/">Golden Bridge</a><a href="https://www.jaiedco.com/">JaiedCo</a><Link href="/privacy">Privacy</Link><a href="#enquiry">Enquire</a><a href="#top" aria-label="Back to top"><ArrowUp size={16}/></a></nav></div>
    </div></footer>
  </div>
}
