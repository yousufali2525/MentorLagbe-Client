"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StudentLayout from "@/components/StudentLayout";
import TutorLayout from "@/components/TutorLayout";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/components/AuthProvider";
import RoleGuard from "@/components/RoleGuard";
import SessionLoader from "@/components/SessionLoader";
import type { Role } from "@/lib/roles";

function requiredRoleForPath(pathname: string): Role | undefined {
  if (pathname.startsWith("/dashboard/student")) return "student";
  if (pathname.startsWith("/dashboard/tutor")) return "tutor";
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  if (pathname.startsWith("/dashboard/applications")) return "student";
  return undefined;
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status, user } = useAuth();

  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
  const isDashboard = pathname.startsWith("/dashboard");
  const allowedRole = isDashboard ? requiredRoleForPath(pathname) : undefined;

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  let mainContent = children;

  if (isDashboard) {
    const role = user?.role?.toLowerCase();

    mainContent = (
      <RoleGuard allowedRole={allowedRole}>
        {role === "tutor" ? (
          <TutorLayout>{children}</TutorLayout>
        ) : role === "admin" ? (
          <AdminLayout>{children}</AdminLayout>
        ) : (
          <StudentLayout>{children}</StudentLayout>
        )}
      </RoleGuard>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1">
        {status === "loading" && isDashboard ? (
          <SessionLoader />
        ) : (
          mainContent
        )}
      </main>

      <Footer />
    </div>
  );
}
