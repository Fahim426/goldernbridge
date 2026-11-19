import { requireAdmin } from "@/lib/auth";
import StaffNav from "@/components/admin/StaffNav";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="staff-workspace">
      <a className="staff-skip" href="#main-content">Skip to workspace content</a>
      <StaffNav name={admin.name} />
      <main id="main-content" tabIndex={-1} className="staff-main">{children}</main>
    </div>
  );
}
