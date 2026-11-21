"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import SessionLoader from "./SessionLoader";
import { dashboardHrefForRole, normalizeRole, type Role } from "@/lib/roles";

export default function RoleGuard({
  allowedRole,
  children,
}: {
  /** Omit for dashboards shared by every authenticated role. */
  allowedRole?: Role;
  children: ReactNode;
}) {
  const { status, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const role = normalizeRole(user?.role);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRole && role !== allowedRole) {
      router.replace(dashboardHrefForRole(role));
    }
  }, [status, role, allowedRole, pathname, router]);

  if (status !== "authenticated") {
    return <SessionLoader />;
  }

  if (allowedRole && role !== allowedRole) {
    return <SessionLoader label="Redirecting to your dashboard..." />;
  }

  return <>{children}</>;
}
