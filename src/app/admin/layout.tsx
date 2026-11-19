import type { Metadata } from "next";
import "./admin.css";
import "./sales.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "Staff workspace | Liora Connect", template: "%s | Liora Connect" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="staff">{children}</div>;
}
