"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Inbox, LayoutDashboard, LogOut } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";

export default function StaffNav({ name }: { name: string }) {
  const pathname = usePathname();
  const inbox = pathname.startsWith("/admin/leads");
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join("");
  return (
    <aside className="staff-sidebar">
      <Link href="/admin" className="staff-logo">
        <Image src="/brand/golden-bridge.webp" alt="Golden Bridge staff home" width={520} height={186} sizes="146px" loading="eager" />
      </Link>
      <nav aria-label="Staff workspace" className="staff-nav">
        <Link href="/admin" aria-current={!inbox ? "page" : undefined}><LayoutDashboard aria-hidden="true" size={18} /> Overview</Link>
        <Link href="/admin/leads" aria-current={inbox ? "page" : undefined}><Inbox aria-hidden="true" size={18} /> Lead inbox</Link>
      </nav>
      <div className="staff-sidebar-foot">
        <Link className="staff-project-link" href="/">View project <ArrowUpRight size={16} aria-hidden="true" /></Link>
        <div className="staff-user">
          <span className="staff-avatar" aria-hidden="true">{initials}</span>
          <span className="staff-identity"><strong>{name}</strong><small>Administrator</small></span>
          <form action={logoutAction}>
            <button aria-label="Sign out" title="Sign out" className="staff-icon-btn" type="submit"><LogOut size={18} aria-hidden="true" /></button>
          </form>
        </div>
      </div>
    </aside>
  );
}
