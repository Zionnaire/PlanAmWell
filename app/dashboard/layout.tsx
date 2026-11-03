"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../components/layout/AdminShell";
import { PartnerProvider } from "../context/PartnerContext";
import { isAdminAuthenticated } from "../services/AdminService";

// Every page under /dashboard/* used to rely on being reached only through
// the logged-in UI flow — nothing actually checked the token, so a signed-out
// visitor (or one whose token expired/was cleared) could load any dashboard
// route directly. Gate it once here instead of repeating the check (as
// app/auth/register/page.tsx does) on every individual page.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace("/auth/login");
    }
  }, [router]);

  return (
    <PartnerProvider>
      <AdminShell>
        <div className="p-6">{children}</div>
      </AdminShell>
    </PartnerProvider>
  );
}