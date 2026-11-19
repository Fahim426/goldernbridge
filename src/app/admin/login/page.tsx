import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, MapPin } from "lucide-react";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/StaffForms";

export const metadata: Metadata = { title: "Staff sign in" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main id="main-content" className="staff-login">
      <section className="staff-login-panel">
        <Link href="/" className="staff-login-logo">
          <Image src="/brand/golden-bridge.webp" width={520} height={186} sizes="180px" loading="eager" alt="Golden Bridge home" />
        </Link>
        <div className="staff-login-form">
          <p className="staff-eyebrow">Liora Connect</p>
          <h1>Staff sign in</h1>
          <p className="staff-intro">Sign in to manage Liora enquiries.</p>
          <LoginForm />
        </div>
        <Link className="staff-back-site" href="/">View the Liora project <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </section>
      <div className="staff-login-image">
        <Image src="/images/liora-sunset.webp" alt="Exterior architectural rendering of Liora on Dubai Islands at sunset" fill sizes="(max-width: 760px) 0px, 50vw" />
        <div><span>Liora</span><p><MapPin size={16} aria-hidden="true" /> Dubai Islands, UAE</p></div>
      </div>
    </main>
  );
}
