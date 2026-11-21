"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import SessionLoader from "@/components/SessionLoader";
import { useAuth } from "@/components/AuthProvider";
import { normalizeRole, type Role } from "@/lib/roles";

const SIDEBAR_PREFIXES = ["/dashboard", "/tuitions", "/pricing", "/payment"];

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function usesSidebarPath(pathname: string) {
  return SIDEBAR_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix));
}

function requiredRoleForPath(pathname: string): Role | undefined {
  if (pathname.startsWith("/dashboard/student")) return "student";
  if (pathname.startsWith("/dashboard/tutor")) return "tutor";
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  if (pathname.startsWith("/dashboard/applications")) return "student";
  return undefined;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { status, user } = useAuth();

  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
  const isDashboard = pathMatchesPrefix(pathname, "/dashboard");
  const isSidebarPath = usesSidebarPath(pathname);
  const role = normalizeRole(user?.role);

  const dashboardLayout = (
    <DashboardLayout role={role ?? "student"}>{children}</DashboardLayout>
  );

  // These routes can switch between the public and dashboard shells, so wait
  // for the session before choosing one.
  if (isSidebarPath && status === "loading") {
    return <SessionLoader />;
  }

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  if (isDashboard) {
    return (
      <RoleGuard allowedRole={requiredRoleForPath(pathname)}>
        {dashboardLayout}
      </RoleGuard>
    );
  }

  if (status === "authenticated" && isSidebarPath) {
    return dashboardLayout;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
